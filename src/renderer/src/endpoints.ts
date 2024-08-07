export const baseUrl: string = 'http://localhost:8080'

export const commands = {
  quit: '/quit'
}

export const endpoints = {
  getByField: '/api/document/fields',
  getContent: '/api/document/content',
  saveDocument: '/api/document/save',
  deleteDocument: '/api/document/delete',
  searchDocument: '/api/document/search'
}
