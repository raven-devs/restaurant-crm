import type { TranslationKey } from './en';

export const uk: Record<TranslationKey, string> = {
  'order.title': 'Замовлення #{{id}}',
  'order.health': 'Стан: {{value}}',
  'order.health.overdue': 'Прострочено',
  'order.health.onTrack': 'Вчасно',
  'order.date': 'Дата: {{value}}',
  'order.client': 'Клієнт: {{value}}',
  'order.items': 'Позиції: {{count}}',
  'order.total': 'Сума: {{value}}',
  'order.status': 'Статус: {{value}}',

  'order.moveTo': 'Перевести в: {{status}}',

  'bot.welcome':
    'Ласкаво просимо до Cake CRM Bot!\n\nКоманди:\n/orders - Список останніх замовлень\n/neworder - Створити нове замовлення\n/help - Допомога',
  'bot.help':
    'Доступні команди:\n/orders - Список останніх замовлень\n/neworder - Створити нове замовлення\n/help - Показати це повідомлення',
  'bot.noOrders': 'Замовлень не знайдено.',
  'bot.statusUpdated': 'Статус оновлено!',
  'bot.orderMoved': 'Замовлення #{{id}} переведено в: {{status}}',
  'bot.statusUpdateFailed': 'Не вдалося оновити статус',

  'status.New': 'Прийняте',
  'status.Accepted': 'Виготовляється',
  'status.In Production': 'Готове',
  'status.Ready': 'Закрите',
  'status.fallback': 'Наступний статус',

  'wizard.step1': 'Крок 1/4: Оберіть клієнта:',
  'wizard.selected': 'Обрано: {{name}}',
  'wizard.step2':
    'Крок 2/4: Оберіть товари (натисніть для додавання, "Готово" коли завершите):',
  'wizard.itemQuantity': '{{name}} x{{quantity}}',
  'wizard.itemAdded': 'Додано: {{name}}',
  'wizard.doneAddingItems': 'Завершити додавання',
  'wizard.addAtLeastOne': 'Додайте хоча б один товар',
  'wizard.step3': 'Крок 3/4: Оберіть канал продажу:',
  'wizard.step4.header': 'Крок 4/4: Підтвердіть замовлення:',
  'wizard.step4.client': 'Клієнт: {{name}}',
  'wizard.step4.channel': 'Канал: {{name}}',
  'wizard.step4.items': 'Позиції:',
  'wizard.step4.confirm': 'Створити це замовлення?',
  'wizard.confirm': 'Підтвердити',
  'wizard.cancel': 'Скасувати',
  'wizard.orderCreated': 'Замовлення створено!',
  'wizard.orderCreatedSuccess': 'Замовлення успішно створено! ID: {{id}}',
  'wizard.orderCreateError': 'Помилка створення замовлення',
  'wizard.error': 'Помилка: {{message}}',
  'wizard.orderCancelled': 'Замовлення скасовано',
  'wizard.orderCancelledMessage': 'Створення замовлення скасовано.',

  'monitoring.overdue':
    '⚠️ Замовлення #{{id}} ({{client}}) прострочено у "{{status}}" — {{elapsed}} хв',
  'monitoring.manager': '👔 [Менеджер] {{message}}',
  'monitoring.escalated': '🔺 [Ескалація] {{message}}',
};
