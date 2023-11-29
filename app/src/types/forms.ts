import { FormTypes } from '~/enum'
import { MixedValue } from './'

type TicketFormField = {
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

type TicketFormSection = {
    label: string
    type: FormTypes
    sections?: {
        [sectionName: string]: TicketFormSection
    }
    fields: {
        [fieldName: string]: TicketFormField
    }
}

type TicketForm = {
    title: string
    description: string
    type: FormTypes
    sections: {
        [sectionName: string]: TicketFormSection
    }
    submitButtonText: string
    submitApiUrl: string
}
  
export { TicketFormField, TicketFormSection, TicketForm }