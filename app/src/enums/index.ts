enum FormTypes {
    'BASE' = 0,
    'STEPS' = 1,
    'TABS' = 2,
}

const FormTypesList = [
    {
      label: 'Base',
      value: FormTypes.BASE,
    },
    {
      label: 'Steps',
      value: FormTypes.STEPS,
    },
    {
      label: 'Tabs',
      value: FormTypes.TABS,
    },
  
]

enum CRUDMode {
Create = 'Create',
Read = 'Read',
Update = 'Update',
}

const CRUDModesList = [
    {
      label: 'Créer',
      value: CRUDMode.Create,
    },
    {
      label: 'Lire',
      value: CRUDMode.Read,
    },
    {
      label: 'Modifier',
      value: CRUDMode.Update,
    },
  ]
  

export { FormTypes, CRUDMode, CRUDModesList, FormTypesList }