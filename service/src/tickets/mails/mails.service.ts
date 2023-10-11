import { AbstractService } from '~/_common/abstracts/abstract.service'
import { Injectable, OnModuleInit } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { ParsedMail } from 'mailparser'
import { ConfigService } from '@nestjs/config'
import { MailsSettingsInterface } from '~/tickets/mails/_interfaces/mails-settings.interface'
import { mkdirSync, writeFileSync } from 'fs'
import openapiTS from 'openapi-typescript'

@Injectable()
export class MailsService extends AbstractService implements OnModuleInit {
  private readonly mailrestConfig: MailsSettingsInterface = this.configService.get<MailsSettingsInterface>('mailrest.options')

  public constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    super()
  }

  public async onModuleInit() {
    console.log('[OpenapiTS] Generating src/_generated/service-api.generated.d.ts...')
    try {
      const fileData = await openapiTS(`${this.mailrestConfig.url}/swagger/json`)
      mkdirSync('src/_generated', { recursive: true })
      writeFileSync('src/_generated/service-api.generated.d.ts', fileData)
      console.log('[OpenapiTS] Generated src/_generated/service-api.generated.d.ts !')
    } catch (error) {
      console.debug('[OpenapiTS] Error while generating src/_generated/service-api.generated.d.ts', error)
    }
  }

  protected async getAccounts(): Promise<any> {
    try {
      const url = `${this.mailrestConfig.url}/accounts`
      const res = await this.httpService.axiosRef.get(url, {
        headers: {
          ...this.mailrestConfig.defaultHeaders || {},
        },
      })
    } catch (e) {
      console.log('e', e.response)
      throw e
    }
  }

  public async search(queries: any): Promise<any> {
    try {
      const res = await this.httpService.axiosRef.get('http://localhost:7200/accounts/clement.mail_mail.libertech.fr/messages', {
        params: {
          ...queries,
          'mailbox': 'INBOX',
        },
        headers: {
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjbGllbnRfaWQiOiJ0ZXN0In0.-Zk1LgAEvZq2YNfkBY8XiMFFXVEeyeRRN0iN6T202D4`,
        },
      })
      return res.data
    } catch (e) {
      console.log('e', e.response)
      throw e
    }
  }

  public async get(uid: string): Promise<ParsedMail> {
    try {
      const res = await this.httpService.axiosRef.get(`http://localhost:7200/accounts/clement.mail_mail.libertech.fr/messages/${uid}/source`, {
        params: {
          'mailbox': 'INBOX',
        },
        headers: {
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjbGllbnRfaWQiOiJ0ZXN0In0.-Zk1LgAEvZq2YNfkBY8XiMFFXVEeyeRRN0iN6T202D4`,
        },
      })
      const { simpleParser } = await import('mailparser')
      return await simpleParser(res.data)
    } catch (e) {
      console.log('e', e.response)
      throw e
    }
  }
}
