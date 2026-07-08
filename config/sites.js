export const FORMS = [
  {
    id: 'website-a-form-1',
    websiteName: 'Nigeria Creator Report',
    formName: 'Creator Report Downloads',
    senderGroupId: 'ej6E1R',
  },
  {
    id: 'website-b-form-1',
    websiteName: 'Africa Creator Report',
    formName: 'Africa Creator Score Card',
    senderGroupId: 'dPG3O6',
  },
  {
    id: 'website-b-form-2',
    websiteName: 'Africa Creator Report',
    formName: 'African Creator Economy Report Wait List',
    senderGroupId: 'dJXX62',
  },
];

export function getFormConfig(formId) {
  const form = FORMS.find((f) => f.id === formId);
  if (!form) {
    throw new Error(`Form ${formId} not found in config`);
  }
  return form;
}

export function getFormsByWebsite(websiteName) {
  return FORMS.filter((f) => f.websiteName === websiteName);
}
