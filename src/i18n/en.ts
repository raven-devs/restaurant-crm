export const en = {
  // telegram.service.ts — formatOrderMessage
  'order.title': 'Order #{{id}}',
  'order.health': 'Health: {{value}}',
  'order.health.overdue': 'Overdue',
  'order.health.onTrack': 'On track',
  'order.date': 'Date: {{value}}',
  'order.client': 'Client: {{value}}',
  'order.items': 'Items: {{count}}',
  'order.total': 'Total: {{value}}',
  'order.status': 'Status: {{value}}',

  // telegram.service.ts — getStatusTransitionButton
  'order.moveTo': 'Move to: {{status}}',

  // telegram.update.ts
  'bot.welcome':
    'Welcome to Cake CRM Bot!\n\nCommands:\n/orders - List recent orders\n/neworder - Create a new order\n/help - Show help',
  'bot.help':
    'Available commands:\n/orders - List recent orders\n/neworder - Start creating a new order\n/help - Show this help message',
  'bot.noOrders': 'No orders found.',
  'bot.statusUpdated': 'Status updated!',
  'bot.orderMoved': 'Order #{{id}} moved to: {{status}}',
  'bot.statusUpdateFailed': 'Failed to update status',

  // telegram.update.ts — status flow display names
  'status.New': 'Accepted',
  'status.Accepted': 'In Production',
  'status.In Production': 'Ready',
  'status.Ready': 'Closed',
  'status.fallback': 'Next Status',

  // new-order.scene.ts
  'wizard.step1': 'Step 1/4: Select a client:',
  'wizard.selected': 'Selected: {{name}}',
  'wizard.step2': 'Step 2/4: Select items (tap to add, "Done" when finished):',
  'wizard.itemQuantity': '{{name}} x{{quantity}}',
  'wizard.itemAdded': 'Added: {{name}}',
  'wizard.doneAddingItems': 'Done adding items',
  'wizard.addAtLeastOne': 'Please add at least one item',
  'wizard.step3': 'Step 3/4: Select sales channel:',
  'wizard.step4.header': 'Step 4/4: Confirm order:',
  'wizard.step4.client': 'Client: {{name}}',
  'wizard.step4.channel': 'Channel: {{name}}',
  'wizard.step4.items': 'Items:',
  'wizard.step4.confirm': 'Create this order?',
  'wizard.confirm': 'Confirm',
  'wizard.cancel': 'Cancel',
  'wizard.orderCreated': 'Order created!',
  'wizard.orderCreatedSuccess': 'Order created successfully! ID: {{id}}',
  'wizard.orderCreateError': 'Error creating order',
  'wizard.error': 'Error: {{message}}',
  'wizard.orderCancelled': 'Order cancelled',
  'wizard.orderCancelledMessage': 'Order creation cancelled.',

  // order-monitoring.service.ts
  'monitoring.overdue':
    '⚠️ Order #{{id}} ({{client}}) overdue in "{{status}}" — {{elapsed}} min elapsed',
  'monitoring.manager': '👔 [Manager] {{message}}',
  'monitoring.escalated': '🔺 [Escalated] {{message}}',
} as const;

export type TranslationKey = keyof typeof en;
