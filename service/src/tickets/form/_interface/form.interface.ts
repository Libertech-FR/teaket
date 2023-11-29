import { Types } from 'mongoose'
import { FormTypes } from '../_enum/types'
import { Form } from '../_schemas/form.schema'
import { MixedValue } from '~/_common/types/mixed-value.type'
interface TicketFormField {
  component: string
  label: string
  'model-value': string
  row: number
  col: number
  attrsOnDefault: {
    [attr: string]: MixedValue
  }
  attrsOnCreate: {
    [attr: string]: MixedValue
  }
  attrsOnRead: {
    [attr: string]: MixedValue
  }
  attrsOnUpdate: {
    [attr: string]: MixedValue
  }
  attrsOnDelete: {
    [attr: string]: MixedValue
  }
}

interface TicketFormSection {
  label: string
  type: FormTypes
  sections?: {
    [sectionName: string]: TicketFormSection
  }
  fields: {
    [fieldName: string]: TicketFormField
  }
}

interface TicketForm {
  title: string
  description: string
  type: FormTypes
  sections: {
    [sectionName: string]: TicketFormSection
  }
  submitButtonText: string
  submitApiUrl: string
}
