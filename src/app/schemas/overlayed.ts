// tslint:disable:object-literal-sort-keys
export const ApplicationSchema = {
  definitions: {
    bounds: {
      type: 'object',
      properties: {
        x: { type: 'number', default: 0 },
        y: { type: 'number', default: 0 },
        width: { type: 'number', default: 680 },
        height: { type: 'number', default: 480 },
      }
    },
    singleLayout: {
      type: 'object',
      properties: {
        x: { type: 'number', default: 1 },
        y: { type: 'number', default: 1 },
        w: { type: 'number', default: 1 },
        h: { type: 'number', default: 1 },
        i: { type: 'string' },
        moved: { type: 'boolean', default: false },
        static: { type: 'boolean', default: false },
      }
    }
  },
  type: 'object',
  properties: {
    overlayed: {
      type: 'object',
      properties: {
        composite: {
          type: 'object',
          properties: {
            bounds: { '$ref': '#/definitions/bounds', __path: 'overlayed.composite.bounds' },
            layout: {
              type: 'array',
              __path: 'overlayed.composite.layout',
              items: { '$ref': '#/definitions/singleLayout' },
            },
            styles: {
              type: 'object',
              properties: {
                edit: {
                  type: 'object',
                  __path: 'overlayed.composite.styles.edit',
                  default: {
                    backgroundColor: 'rgba(51, 138, 36, 0.6)',
                    border: '2px solid red'
                  }
                },
                live: {
                  type: 'object',
                  __path: 'overlayed.composite.styles.live',
                  default: {
                    backgroundColor: 'rgba(0, 0, 0, 0)',
                    border: 'none'
                  }
                }
              }
            }
          }
        },
        settings: {
          type: 'object',
          properties: {
            bounds: { '$ref': '#/definitions/bounds', __path: 'overlayed.settings.bounds', }
          }
        }
      }
    },
    extensions: {
      type: 'object',
      __path: 'overlayed.extensions',
    }
  }
}