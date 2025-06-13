import { Language } from '../store/slices/languageSlice';

export const translations = {
  en: {
    common: {
      settings: 'Settings',
      profile: 'Profile',
      edit: 'Edit',
      save: 'Save',
      cancel: 'Cancel',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      dashboard: 'Dashboard',
      packages: 'Packages',
    },
    settings: {
      language: 'Language',
      theme: 'Theme',
      notifications: 'Notifications',
      about: 'About',
      logout: 'Logout',
    },
    profile: {
      username: 'Username',
      firstName: 'First Name',
      lastName: 'Last Name',
      email: 'Email',
      phoneNumber: 'Phone Number',
      group: 'Group',
      sector: 'Sector',
      editProfile: 'Edit Profile',
    },
  },
  ru: {
    common: {
      settings: 'Настройки',
      profile: 'Профиль',
      edit: 'Редактировать',
      save: 'Сохранить',
      cancel: 'Отмена',
      loading: 'Загрузка...',
      error: 'Ошибка',
      success: 'Успешно',
      dashboard: 'Панель управления',
      packages: 'Пакеты',
    },
    settings: {
      language: 'Язык',
      theme: 'Тема',
      notifications: 'Уведомления',
      about: 'О приложении',
      logout: 'Выйти',
    },
    profile: {
      username: 'Имя пользователя',
      firstName: 'Имя',
      lastName: 'Фамилия',
      email: 'Электронная почта',
      phoneNumber: 'Номер телефона',
      group: 'Группа',
      sector: 'Сектор',
      editProfile: 'Редактировать профиль',
    },
  },
  az: {
    common: {
      settings: 'Parametrlər',
      profile: 'Profil',
      edit: 'Düzəliş et',
      save: 'Yadda saxla',
      cancel: 'Ləğv et',
      loading: 'Yüklənir...',
      error: 'Xəta',
      success: 'Uğurlu',
      dashboard: 'İdarə paneli',
      packages: 'Paketlər',
    },
    settings: {
      language: 'Dil',
      theme: 'Tema',
      notifications: 'Bildirişlər',
      about: 'Haqqında',
      logout: 'Çıxış',
    },
    profile: {
      username: 'İstifadəçi adı',
      firstName: 'Ad',
      lastName: 'Soyad',
      email: 'E-poçt',
      phoneNumber: 'Telefon nömrəsi',
      group: 'Qrup',
      sector: 'Sektor',
      editProfile: 'Profili düzəliş et',
    },
  },
};

export const getTranslation = (key: string, language: Language = 'en'): string => {
  const keys = key.split('.');
  let value: any = translations[language];

  for (const k of keys) {
    if (value && typeof value === 'object') {
      value = value[k];
    } else {
      return key;
    }
  }

  return typeof value === 'string' ? value : key;
}; 