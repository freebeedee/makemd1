import { frameRootWithProps } from "core/utils/frames/frames";
import { FrameRoot } from "shared/types/mframe";
import { groupNode, iconNode, textNode } from "../base";
import { checkboxNode, listItemNode, listNode } from "../ui";

export const taskListItem = () : FrameRoot => ({
  def: {
    id: 'taskListItem',
    type: 'listItem',
  },
  node: {
    type: 'group',
    id: '$root',
    schemaId: '$root',
    name: 'Task Item',
    rank: 0,
    props: {
      _selected: `$root.props['_selectedIndexes']?.some(f => f == $contexts.$context['_index'])`,
      _selectedIndexes: '[]',
      _expanded: `false`,
      _nestBy: ``,
      completedField: `'completed'`,
      dueField: `'due'`,
      priorityField: `'priority'`,
      fields: ``,
      list: ``
    },
    styles: {
      layout: `"column"`,
      overflow: `'hidden'`,
      width: `'100%'`,
      layoutAlign: `'w'`,
      alignItems: `'stretch'`,
    },
    types: {
      completedField: 'option',
      dueField: 'option',
      priorityField: 'option',
      _nestBy: 'text',
      _expanded: 'boolean',
      _selected: 'boolean',
      fields: 'option-multi',
      list: 'option'
    },
    propsValue: {
      completedField: {
        alias: i18n.labels.completed,
        source: `$properties`,
      },
      dueField: {
        alias: i18n.labels.due,
        source: `$properties`,
      },
      list: {
        alias: i18n.labels.list,
        source: `$properties`,
      },
      fields: {
        alias: i18n.labels.fields,
        source: `$properties`,
      },
      priorityField: {
        alias: i18n.labels.priority,
        source: `$properties`,
      }
    },
    interactions: {
      onClick: 'select',
      onDoubleClick: 'open',
      onContextMenu: 'contextMenu',
    }
  },
  id: '$root',
  children: [
    {
      ...groupNode,
      node: {
        ...groupNode.node,
        id: '$item',
        styles: {
          layout: `'row'`,
          gap: `'8px'`,
          flex: `'1'`,
          padding: `'4px'`,
          layoutAlign: `'w'`,
          height: `'auto'`,
          background: `'transparent'`,
          borderRadius: `'4px'`,
        }
      },
      children: [
        kitWithProps(
          checkboxNode(),
          {
            value: `$contexts.$context['_path']?.[$root.props.completedField]`,
          },
          {},
          {
            toggle: `$api.table.update($contexts.$context['_path'], $contexts.$context['_schema'], [{field: '_index', value: $contexts.$context['_index']}], { [$root.props.completedField]: $contexts.$context['_path']?.[$root.props.completedField] ? 'false' : 'true' })`,
          },
          {
            onClick: 'toggle'
          }
        ),
        {
          ...groupNode,
          node: {
            ...groupNode.node,
            styles: {
              layout: `'column'`,
              flex: `'1'`,
            }
          },
          children: [
            {
              ...groupNode,
              node: {
                ...groupNode.node,
                styles: {
                  layout: `'row'`,
                  gap: `'8px'`,
                  alignItems: `'center'`,
                }
              },
              children: [
                frameRootWithProps(
                  textNode,
                  {
                    value: `$contexts.$context['_name']`,
                  },
                  {
                    '--font-text-size': `'14px'`,
                    '--font-text-weight': `'400'`,
                    width: `'auto'`,
                  }
                ),
                frameRootWithProps(groupNode, {}, {
                  flex: `'1'`,
                }),
                frameRootWithProps(
                  flowNode,
                  {
                    value: `$contexts.$context['_path']?.[$root.props.list]`,
                  },
                  {
                    padding: `'0'`,
                    width: `'auto'`,
                    "--mk-link": `true`,
                  }
                ),
                frameRootWithProps(
                  iconNode,
                  {
                    value: `'ui//collapse'`,
                  },
                  {
                    width: `'20px'`,
                    height: `'20px'`,
                    padding: `'4px'`,
                    '--icon-size': `'12px'`,
                    transform: `$root.props['_expanded'] ? 'rotate(90deg)' : ''`,
                    hidden: `!($root.props['_nestBy']?.length > 0)`,
                  },
                  {
                    expand: `$saveState({ $root: {props: {_expanded: !$root.props['_expanded']}} });`,
                  },
                  {
                    onClick: 'expand'
                  }
                )
              ]
            }
          ]
        },
        {
          ...groupNode,
          node: {
            ...groupNode.node,
            styles: {
              layout: `'row'`,
              padding: `'2px 4px'`,
              layoutAlign: `'w'`,
              borderRadius: `'4px'`,
              height: `'auto'`,
              width: `'auto'`,
              hidden: `!($contexts[$contexts.$context['_path']]?.[$root.props.dueField]?.length > 0)`,
              background: `'var(--mk-ui-active)'`,
            }
          },
          children: [
            frameRootWithProps(
              textNode,
              {
                value: `$api.utils.date.format($api.utils.date.parse($contexts.$context['_path']?.[$root.props.dueField]))`,
              },
              {
                '--font-text-size': `'12px'`,
                '--font-text-weight': `'400'`,
                width: `'auto'`,
              }
            )
          ]
        }
      ]
    },
    frameRootWithProps(
      contentNode,
      {},
      {
        layout: `'column'`,
        alignItems: `'stretch'`,
        width: `'100%'`,
      }
    ),
    frameRootWithProps(
      {
        ...slidesNode,
        children: [
          frameRootWithProps(
            {
              ...slideNode,
              children: [
                frameRootWithProps(
                  { ...deltaNode, node: { ...deltaNode.node, ref: '$item' } },
                  {},
                  {
                    background: `'var(--mk-ui-background-selected)'`,
                  }
                )
              ]
            },
            { value: 'true' }
          ),
          frameRootWithProps(
            {
              ...slideNode,
              children: [
                frameRootWithProps(
                  { ...deltaNode, node: { ...deltaNode.node, ref: '$item' } },
                  {},
                  {
                    background: `'transparent'`,
                  }
                )
              ]
            },
            { value: 'false' }
          )
        ]
      },
      {
        value: `'_selected'`,
      }
    )
  ]
});

  export const overviewItem: FrameRoot = {
    def: {
      id: 'overviewItem',
        type: 'listItem'
    },
    node: {
      type: "group",
      id: "$root",
      schemaId: "$root",
      name: "Overview Item",
      rank: 0,
      props: {
        _selected: `$root.props['_selectedIndexes']?.some(f => f == $contexts.$context['_index'])`,
        _selectedIndexes: '[]',
      },
      styles: {
        layout: `"row"`,
        gap: `'12px'`,
        padding: `'8px'`,
        overflow: `'hidden'`,
        width: `'100%'`,
        borderBottom: `'thin solid var(--mk-ui-border)'`,
        sem: `'contextItem'`
      },
      interactions: {
      onClick: 'select',
      onDoubleClick: 'open',
      onContextMenu: 'contextMenu',
    },
    },
    id: "$root",
    children: [
      frameRootWithProps(
        {
          ...slidesNode,
          children: [
            frameRootWithProps(
              {
                ...slideNode,
                children: [
                  frameRootWithProps(
                    { ...deltaNode, node: { ...deltaNode.node, ref: "$root" } },
                    {},
                    {
                      background: `'var(--mk-ui-background-selected)'`,
                    }
                  ),
                ],
              },
              { value: "true" }
            ),
            frameRootWithProps(
              {
                ...slideNode,
                children: [
                  frameRootWithProps(
                    { ...deltaNode, node: { ...deltaNode.node, ref: "$root" } },
                    {},
                    {
                      background: `'transparent'`,
                    }
                  ),
                ],
              },
              { value: "false" }
            ),
          ],
        },
        {
          value: `'_selected'`,
        }
      ),
      {
        ...groupNode,
        node: {
          ...groupNode.node,
          styles: {
            gap: `'8px'`,
            flex: `'1'`,
            padding: `'2px'`,
            layout: `'column'`,
            overflow: `'hidden'`
          },
        },
        children: [
          frameRootWithProps({...groupNode, children: [
            frameRootWithProps(
              iconNode,
              {
                value: `$api.path.label($contexts.$context['_keyValue'])?.sticker`,
              },
              {
                width: `'20px'`,
                height: `'20px'`,
                padding: `'2px'`,
                "--icon-size": `'14px'`,
                borderRadius: `'4px'`,
                overflow: `'hidden'`,
                  background: `$api.path.label($contexts.$context['_keyValue'])?.color`,
    
              }
            ),
            frameRootWithProps(
              textNode,
              {
                value: `$contexts.$context['_name']`,
              },
              {
                "--font-text-size": `'14px'`,
                "--font-text-weight": `'var(--bold-weight)'`,
              }
            ),
          ]}, {}, {
            layout: `"row"`,
            height: `'auto'`,
            width: `'auto'`,
            gap: `'4px'`

      }),
          
      
          frameRootWithProps(textNode, {
            value: `$api.path.label($contexts.$context['_keyValue'])?.preview`,
          }, {
            "--font-text-size": `'14px'`,
            "--font-text-color": `'var(--mk-ui-text-tertiary)'`,
            "--line-count": '2'
          }),
        ],
      },
      frameRootWithProps(
        imageNode,
        {
          value: `$api.path.label($contexts.$context['_keyValue'])?.cover`,
        }, {
          radius: `'4px'`,
        width: `'64px'`,
        height: `'64px'`,
          borderRadius: `'8px'`,
          hidden: `($api.path.label($contexts.$context['_keyValue'])?.cover ?? '').length == 0`
        }
        
      ),
    ],
  }

  export const detailItem: FrameRoot = {
    def: {
      id: 'detailItem',
        type: 'listItem'
    },
    node: {
      type: "group",
      id: "$root",
      schemaId: "$root",
      name: "Detail View",
      rank: 0,
      props: {
        _selected: `$root.props['_selectedIndexes']?.some(f => f == $contexts.$context['_index'])`,
        _selectedIndexes: '[]',
        showLabel: 'true',
        showSticker: 'false'
      },
      types: {
        showLabel: "boolean",
        showSticker: "boolean"
      },
      propsValue: {
        showLabel: {
          alias: i18n.labels.showFieldLabels
        },
        showSticker: {
          alias: i18n.labels.showFieldIcons
        }
      },
      styles: {
        layout: `"row"`,
        gap: `'12px'`,
        padding: `'8px'`,
        overflow: `'hidden'`,
        width: `'100%'`,
        sem: `'contextItem'`
      },
      interactions: {
      onClick: 'select',
      onDoubleClick: 'open',
      onContextMenu: 'contextMenu',
    },
    },
    id: "$root",
    children: [
      frameRootWithProps(
        {
          ...slidesNode,
          children: [
            frameRootWithProps(
              {
                ...slideNode,
                children: [
                  frameRootWithProps(
                    { ...deltaNode, node: { ...deltaNode.node, ref: "$root" } },
                    {},
                    {
                      background: `'var(--mk-ui-background-selected)'`,
                    }
                  ),
                ],
              },
              { value: "true" }
            ),
            frameRootWithProps(
              {
                ...slideNode,
                children: [
                  frameRootWithProps(
                    { ...deltaNode, node: { ...deltaNode.node, ref: "$root" } },
                    {},
                    {
                      background: `'transparent'`,
                    }
                  ),
                ],
              },
              { value: "false" }
            ),
          ],
        },
        {
          value: `'_selected'`,
        }
      ),
      kitWithProps(previewNode(), {
        path: `$contexts.$context['_keyValue']`,
        radius: `'4px'`,
        width: `'50px'`,
        height: `'50px'`
      }, {
        height: `'50px'`,
        borderRadius: `'8px'`,
        background: `'var(--background-secondary)'`,
      }
      ),
      {
        ...groupNode,
        node: {
          ...groupNode.node,
          styles: {
            gap: `'8px'`,
            flex: `'1'`,
            padding: `'2px'`,
            paddingBottom: `'12px'`,
            layout: `'column'`,
            borderBottom: `'thin solid var(--mk-ui-border)'`,
          },
        },
        children: [
          frameRootWithProps(
            textNode,
            {
              value: `$contexts.$context['_name']`,
            },
            {
              "--font-text-size": `'18px'`,
              "--font-text-weight": `'var(--bold-weight)'`,
            }
          ),
          frameRootWithProps(textNode, {
            value: `$api.path.label($contexts.$context['_keyValue'])?.preview`,
          }, {
            "--font-text-size": `'14px'`,
            "--font-text-color": `'var(--mk-ui-text-tertiary)'`,
          }),
          kitWithProps(fieldsView, {
            label: `$root.props.showLabel`,
            sticker: `$root.props.showSticker`
          })
        ],
      },
    ],
  };
  
  

  export const newItemNode : FrameRoot = {
    id: "newItem",
  def: {
    id: 'newItem',
  },
  node: {
    schemaId: "newItem",
    parentId: "",
    name: "New Item",
    rank: 0,
    id: "newItem",
    type: "group",
    props: {
      space: "",
      schema: '',
      key: '',
      group: "",
      groupValue: ""
    },
    types: {
      space: "text",
      schema: "text",
      key: "text",
      group: "text",
      groupValue: "text"
    },
    
    actions: {
      
    },
    styles: {
      gap: `'12px'`,
      layout: `'row'`,
      padding: `'4px'`
    }
  }, children: [ frameRootWithProps({
        ...groupNode, 
        children: [
     frameRootWithProps(iconNode, {
            value: `'ui//plus'`
          }, {
            width: `'16px'`,
            height: `'16px'`,
            '--icon-size': `'16px'`,
            
          })]
        }, {}, { width: `'32px'`,
            height: `'32px'`, layoutAlign: `'m'`, background: `'var(--background-secondary)'`,
            borderRadius: `'4px'`}),
    {
      ...inputNode, node: {
        ...inputNode.node,
        styles: {...inputNode.node.styles, placeholder: `'New Item'`, border: `'none'`, background: `'transparent'`},
        actions: {
      onEnter: `$api.table.insert($root.props.space, $root.props.schema, {[$root.props.group]: $root.props.groupValue, [$root.props.key]: $value}); $event.currentTarget.value = ''`,
        },
      }
    }
  ]
  }

  export const newItemButton : FrameRoot = {
    id: "newItemButton",
    def: {
      id: 'newItemButton',
    },
    node: {
      schemaId: "newItemButton",
      parentId: "",
      name: i18n.labels.newItemButton,
      rank: 0,
      id: "newItemButton",
      type: "group",
      props: {
      space: "",
      schema: '',
      group: "",
      groupValue: ""
    },
      types: {
      space: "text",
      schema: "text",
      group: "text",
      groupValue: "text"
    },
      actions: {
        openNewModal: `{
          command: "spaces://$api/table/#;createModal",
          parameters: {
            space: newItemButton.props.space,
            schema: newItemButton.props.schema,
            properties: newItemButton.props.group ? {[newItemButton.props.group]: newItemButton.props.groupValue} : {},
          }
      }`
      },
      styles: {
        padding: `'8px'`,
        width: `'100%'`,
        sem: `'card'`,
        cursor: `'pointer'`,
      },
      interactions: {
        onClick: 'openNewModal'
      }
    }, 
    children: [
      frameRootWithProps({
        ...groupNode, 
        children: [
          frameRootWithProps(iconNode, {
            value: `'ui//plus'`
          }, {
            width: `'16px'`,
            height: `'16px'`,
            '--icon-size': `'16px'`,
          }),
          frameRootWithProps(textNode, {
            value: `'New Item'`
          }, {
            '--font-text-color': `'var(--mk-ui-text)'`,
            "--font-text-size": `'14px'`,
          })
        ]
      }, {}, {
        layout: `'row'`,
        gap: `'8px'`,
        alignItems: `'center'`,
      })
    ]
  }

