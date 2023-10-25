import { AbstractService } from '~/_common/abstracts/abstract.service'
import { HttpException, Injectable } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { ParsedMail } from 'mailparser'
import { MailRestAccountType, MailRestMailSubmit, MailRestMailSubmited, MailRestMessageType } from '~/tickets/mails/_types/mailrest-generated.type'
import { SettingsService } from '~/core/settings/settings.service'
import { MailsSettingsInterface } from '~/tickets/mails/_interfaces/mails-settings.interface'
import { omit } from 'radash'
import { ServiceUnavailableException } from '@nestjs/common/exceptions/service-unavailable.exception'
import { SearchMailsDto } from '~/tickets/mails/_dto/search-mails.dto'
import { SettingFor } from '~/core/settings/_enum/setting-for.enum'
import { createHash } from 'crypto'
import FormData from 'form-data'

@Injectable()
export class MailsService extends AbstractService {
  public constructor(private readonly httpService: HttpService, private readonly settings: SettingsService) {
    super()
  }

  protected async getMailrestConfig(): Promise<MailsSettingsInterface> {
    return await this.settings.get<MailsSettingsInterface>('tickets.mails.mailrest', {
      for: SettingFor.ALL,
      callback: (value) => {
        return {
          ...value,
          url: value.url.replace(/\/$/, ''),
        }
      },
    })
  }

  public async getAccounts(): Promise<MailRestAccountType[]> {
    this.logger.debug(`Update list of mailrest accounts`)
    try {
      const mailrestConfig = await this.getMailrestConfig()
      const url = `${mailrestConfig.url}/accounts`
      const res = await this.httpService.axiosRef.get<{ data: MailRestAccountType[] }>(url, {
        headers: {
          ...(mailrestConfig.defaultHeaders || {}),
          Authorization: `Bearer ${mailrestConfig.token}`,
        },
      })
      return res.data.data
    } catch (e) {
      const msg = `Error while getting accounts: ${JSON.stringify(e.response?.data || e)}`
      this.logger.error(msg)
      throw new ServiceUnavailableException(e, msg)
    }
  }

  public async search(queries: SearchMailsDto): Promise<[MailRestMessageType[], number]> {
    let data = []
    let total = 0
    this.logger.debug(`Searching mails with queries <${JSON.stringify(queries)}>`)
    try {
      const mailrestConfig = await this.getMailrestConfig()
      const accounts = await this.getAccounts()
      for (const account of accounts) {
        if (queries.accounts?.length && !queries.accounts?.includes(account.id)) continue
        const url = `${mailrestConfig.url}/accounts/${account.id}/messages`
        const res = await this.httpService.axiosRef.get<{ data: MailRestMessageType[]; total: number }>(url, {
          params: omit(queries, ['accounts']),
          headers: {
            ...(mailrestConfig.defaultHeaders || {}),
            Authorization: `Bearer ${mailrestConfig.token}`,
          },
        })
        data = data.concat(
          res.data.data.map((message) => ({
            ...message,
            accountId: account.id,
            accountName: account.name,
          })),
        )
        total += res.data.total
      }
    } catch (e) {
      const msg = `Error while searching mails: ${JSON.stringify(e.response?.data || e.stack)}`
      this.logger.error(msg)
      throw new ServiceUnavailableException(e, msg)
    }
    return [data, total]
  }

  public async getSignature(source: string): Promise<string> {
    return createHash('sha256').update(source).digest('hex')
  }

  public async get(account: string, seq: string): Promise<[string, ParsedMail]> {
    const { simpleParser } = await import('mailparser')
    const source = await this.getSource(account, seq)
    const fingerprint = await this.getSignature(source)
    const parser = await simpleParser(source)
    return [fingerprint, parser]
  }

  public async getSource(account: string, seq: string): Promise<string> {
    this.logger.debug(`Getting source for account <${account}> and seq <${seq}>`)
    try {
      const mailrestConfig = await this.getMailrestConfig()
      const url = `${mailrestConfig.url}/accounts/${account}/messages/${seq}/source`
      const res = await this.httpService.axiosRef.get<string>(url, {
        headers: {
          ...(mailrestConfig.defaultHeaders || {}),
          Authorization: `Bearer ${mailrestConfig.token}`,
        },
      })
      return res.data
    } catch (e) {
      const msg = `Error to parse message with seq <${seq}>: ${JSON.stringify(e.response?.data || e)}`
      this.logger.error(msg)
      throw new ServiceUnavailableException(e, msg)
    }
  }

  public async delete(account: string, seq: string): Promise<boolean> {
    this.logger.debug(`Attempt to delete message with seq <${seq}>`)
    try {
      const mailrestConfig = await this.getMailrestConfig()
      const url = `${mailrestConfig.url}/accounts/${account}/messages/${seq}`
      const res = await this.httpService.axiosRef.delete<{ deleted?: boolean }>(url, {
        headers: {
          ...(mailrestConfig.defaultHeaders || {}),
          Authorization: `Bearer ${mailrestConfig.token}`,
        },
      })
      return res.data.deleted
    } catch (e) {
      const msg = `Error to delete message with seq <${seq}>: ${JSON.stringify(e.response?.data || e)}`
      this.logger.error(msg)
      throw new ServiceUnavailableException(e, msg)
    }
  }

  public async submit(account: string, form: MailRestMailSubmit, files?: Express.Multer.File[]): Promise<MailRestMailSubmited> {
    this.logger.debug(`Attempt to submit message with account <${account}>`)
    try {
      const mailrestConfig = await this.getMailrestConfig()
      const url = `${mailrestConfig.url}/accounts/${account}/submit`
      const formData = new FormData()
      const keys = Object.entries(form).filter(([_, value]) => value !== undefined)
      for (const [key, value] of keys) {
        if (!Array.isArray(value)) {
          formData.append(key, value)
        } else {
          value.forEach((v) => formData.append(key, v))
        }
      }
      if (files?.length) {
        for (const file of files) {
          formData.append('files', file.buffer, {
            filename: file.originalname,
          })
        }
      }
      const res = await this.httpService.axiosRef.post<{ data: MailRestMailSubmited }>(url, formData, {
        headers: {
          ...(mailrestConfig.defaultHeaders || {}),
          Authorization: `Bearer ${mailrestConfig.token}`,
          'Content-Type': 'multipart/form-data',
        },
      })
      return res.data?.data
    } catch (e) {
      const msg = `Error to submit message with account <${account}>: ${JSON.stringify(e.response?.data || e)}`
      if (e.response) {
        const validations = {}
        for (const [key, value] of Object.entries(e.response?.data?.validations || {})) {
          validations['mailinfo.' + key] = value
        }
        throw new HttpException(
          {
            statusCode: e.response?.status,
            message: msg,
            validations,
          },
          e.response.status,
        )
      }
      console.log(e)
      this.logger.error(msg)
      throw new ServiceUnavailableException(e, msg)
    }
  }
}
