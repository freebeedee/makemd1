import { frameRootWithProps, kitWithProps } from "core/utils/frames/frames";
import { FrameRoot } from "shared/types/mframe";
import { contentNode, dataNode, flowNode, groupNode, iconNode, imageNode, inputNode, textNode } from "../base";
import { deltaNode, slideNode, slidesNode } from "../slides";
import { checkboxNode, listItemNode, listNode, previewNode } from "../ui";

export const coverListItem: FrameRoot = {
  def: {
    id: 'coverListItem',
      type: 'listItem'
  },
  node: {
    type: "group",
    id: "$root",
    schemaId: "$root",
    name: "Cover Item",
    rank: 0,
    props: {
        coverProperty: `'File'`
    },
    types: {
      // hideCover: "boolean",
      coverProperty: "option"
    },
    propsValue: {
      coverProperty: {
        alias: "Cover Image",
        source: `$properties`
      }
    },
    styles: {
      layout: `"column"`,
      width: `'200px'`,
      sem: `'contextItem'`,
      hidden: `($api.path.thumbnail($contexts[$contexts.$context['_path']]?.[$root.props.coverProperty]) ?? $contexts.$context['_values']?.[$root.props.coverProperty] ?? '').length == 0`
    },
    
  },
  id: "$root",
  children: [
    frameRootWithProps(
       {...groupNode, children: [frameRootWithProps(
        imageNode,
        {
          value: `$api.path.thumbnail($contexts[$contexts.$context['_path']]?.[$root.props.coverProperty]) ?? $contexts.$context['_values']?.[$root.props.coverProperty]`,
        },
        {
          width: `'200px'`,
          height: `'300px'`,
          borderRadius: `'8px'`,
        }
    )]},
      {
      }, {
        background: `'var(--mk-ui-background-contrast)'`,
        borderRadius: `'8px'`,
        width: `'200px'`,
      height: `'300px'`
      }
      
    ),
    frameRootWithProps(
      flowNode,
      {
        value: `$contexts.$context['_keyValue']`,
      },
      {
        padding:`'4px'`,
      })
    
  ],
}
export const imageListItem: FrameRoot = {
  def: {
    id: 'imageListItem',
      type: 'listItem'
  },
  node: {
    type: "group",
    id: "$root",
    schemaId: "$root",
    name: "Image Item",
    rank: 0,
    props: {
        coverProperty: `'File'`,
        _selected: `$root.props['_selectedIndexes']?.some(f => f == $contexts.$context['_index'])`,
        _selectedIndexes: '[]',
        
    },
    types: {
      // hideCover: "boolean",
      coverProperty: "option"
    },
    propsValue: {
      coverProperty: {
        alias: "Cover Image",
        source: `$properties`
      }
    },
    
    styles: {
      layout: `"row"`,
      boxShadow: `'var(--mk-shadow-card)'`,
      margin: `'2px'`,
      marginBottom: `'8px'`,
      borderRadius: `'8px'`,
      sem: `'contextItem'`,
      hidden: `($api.path.thumbnail($contexts[$contexts.$context['_path']]?.[$root.props.coverProperty]) ?? $contexts.$context['_values']?.[$root.props.coverProperty] ?? '').length == 0`
      
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
      imageNode,
      {
        value: `$api.path.thumbnail($contexts[$contexts.$context['_path']]?.[$root.props.coverProperty]) ?? $contexts.$context['_values']?.[$root.props.coverProperty]`,
      }, {
        borderRadius: `'8px'`,
      }
      
    ),
    frameRootWithProps(
      {...groupNode, children: [
        
      
      
      {
        ...groupNode,
        node: {
          ...groupNode.node,
          styles: {
            gap: `'8px'`,
            padding: `'8px'`,
            flex: `'1'`,
            width: `'100%'`,
            background: `'var(--mk-gradient-overlay)'`
          },
        },
        children: [
          frameRootWithProps(
        {...groupNode, children: [frameRootWithProps(
          iconNode,
          {
            value: `$api.path.label($contexts.$context['_keyValue'])?.sticker`,
          },
          {
            width: `'32px'`,
            height: `'32px'`,
            padding: `'4px'`,
            "--icon-size": `'24px'`,
            borderRadius: `'4px'`,
            overflow: `'hidden'`,
              background: `$api.path.label($contexts.$context['_keyValue'])?.color`,
            
          }
        ),
        

        ]},
        {},
        {
          width: `'32px'`,
            height: `'32px'`,
          hidden: `!$contexts.$context['_isContext']`,
          marginLeft: `'4px'`,
          borderRadius: `'4px'`,
          background: `'var(--mk-ui-background-contrast)'`,
          // hidden: `$root.props.hideCover`
        }
      ),
          frameRootWithProps(
            textNode,
            {
                            value: `$contexts.$context['_name']`,

            },
            {
              "--font-text-weight": `'var(--bold-weight)'`,
            }
          ),
         
        ],
      },
      ]},
      {

      },
      {
        position: `'absolute'`,
        height: `'100%'`,
        width: `'100%'`,
        "hover:opacity": `'1'`,
        opacity: `'0'`,
        transition: `'all 0.2s ease'`
      }
    )
    
  ],
}

export const flowListItem: FrameRoot = {
    def: {
      id: 'flowListItem',
        type: 'listItem'
    },
    node: {
      type: "group",
      id: "$root",
      schemaId: "$root",
      name: "Flow Item",
      rank: 0,
      props: {
        _selected: `$root.props['_selectedIndexes']?.some(f => f == $contexts.$context['_index'])`,
        _selectedIndexes: '[]',
        expanded: 'true',
        seamless: 'false'
      },
      types: {
        expanded: 'boolean',
        seamless: 'boolean'
      },
      propsValue: {
        expanded: {
          alias: i18n.labels.expanded,
        },
        seamless: {
          alias: "Seamless",
        }
      },
      styles: {
        layout: `"row"`,
        gap: `'8px'`,
        sem: `'contextItem'`
      },
      actions: {
        
      },
    },
    id: "$root",
    children: [
      
      frameRootWithProps(
        flowNode,
        {
          value: `$contexts.$context['_keyValue']`,
        },
        {
          "--mk-expanded": `$root.props.expanded`,
          "--mk-min-mode": `$root.props.seamless`,
          padding:`'4px'`,
          marginBottom: `'8px'`
        }
        
      ),
      
    ],
  };


  export const cardsListItem: FrameRoot = {
    def: {
      id: 'cardsListItem',
        type: 'listItem'
    },
    node: {
      type: "group",
      id: "$root",
      schemaId: "$root",
      name: "Cards Item",
      rank: 0,
      props: {
        _selected: `$root.props['_selectedIndexes']?.some(f => f == $contexts.$context['_index'])`,
        _selectedIndexes: '[]',
        // hideCover: `false`,
        coverProperty: `'File'`,
        showLabel: 'true',
        showSticker: 'false'
      },
      types: {
        // hideCover: "boolean",
        coverProperty: "option",
        showLabel: "boolean",
        showSticker: "boolean"
      },
      
      propsValue: {
        coverProperty: {
          alias: "Cover Image",
          source: `$properties`
        },
        showLabel: {
          alias: i18n.labels.showFieldLabels
        },
        showSticker: {
          alias: i18n.labels.showFieldIcons
        }
      },

      styles: {
        layout: `"column"`,
        overflow: `'hidden'`,
        width: `'100%'`,
        height: `'100%'`,
        padding: `'0'`,
        sem: `'card'`
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
                      sem: `'card-selected'`,
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
                      sem: `'card'`,
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
      
      frameRootWithProps(
        {...groupNode, children: [frameRootWithProps(
          imageNode,
          {
            
            value: `$api.path.label($contexts[$contexts.$context['_path']]?.[$root.props.coverProperty])?.cover ?? $contexts.$context['_values']?.[$root.props.coverProperty]`,
          },
          {
            width: `'100%'`,
            height: `'80px'`,
            
          }
        ),
        

        ]},
        {},
        {
          width: `'100%'`,
          height: `'80px'`,
          background: `'var(--mk-ui-background-contrast)'`,
          hidden: `!$contexts.$context['_isContext']`,
        }
      ),
      frameRootWithProps(
        {...groupNode, children: [frameRootWithProps(
          iconNode,
          {
            value: `$api.path.label($contexts.$context['_keyValue'])?.sticker`,
          },
          {
            width: `'32px'`,
            height: `'32px'`,
            padding: `'4px'`,
            "--icon-size": `'24px'`,
            borderRadius: `'4px'`,
            overflow: `'hidden'`,
              background: `$api.path.label($contexts.$context['_keyValue'])?.color`,
            
          }
        ),
        

        ]},
        {},
        {
          width: `'32px'`,
            height: `'32px'`,
          hidden: `!$contexts.$context['_isContext']`,
          marginTop: `'-16px'`,
          marginLeft: `'4px'`,
          borderRadius: `'4px'`,
          background: `'var(--mk-ui-background-contrast)'`,
          // hidden: `$root.props.hideCover`
        }
      ),
      
      
      {
        ...groupNode,
        node: {
          ...groupNode.node,
          styles: {
            gap: `'8px'`,
            padding: `'8px'`,
            flex: `'1'`,
          },
        },
        children: [
          frameRootWithProps(
            textNode,
            {
                            value: `$contexts.$context['_name']`,

            },
            {
              "--font-text-weight": `'var(--bold-weight)'`,
            }
          ),
          kitWithProps(fieldsView, {
            label: `$root.props.showLabel`,
            sticker: `$root.props.showSticker`
          }, {marginTop: `'8px'`})
        ],
      },
    ],
  };
  
  export const cardListItem: FrameRoot = {
    def: {
      id: 'cardListItem',
        type: 'listItem'
    },
    node: {
      type: "group",
      id: "$root",
      schemaId: "$root",
      name: "Card Item",
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
        layout: `"column"`,
        overflow: `'hidden'`,
        borderRadius: `'8px'`,
        width: `'100%'`,
        border: `'1px solid var(--mk-ui-border)'`,
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
                      background: `'var(--mk-ui-background)'`,
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
      frameRootWithProps(
        imageNode,
        {
          value: `$api.path.label($contexts.$context['_keyValue'])?.cover`,
        },
        {
          width: `'100%'`,
          maxHeight: `'80px'`,
          
        }
      ),
      
      {
        ...groupNode,
        node: {
          ...groupNode.node,
          styles: {
            layout: `'column'`,
            gap: `'8px'`,
            padding: `'8px'`,
            flex: `'1'`,
          },
        },
        children: [
          frameRootWithProps(
            textNode,
            {
              value: `$contexts.$context['_name']`,
            },
            
          ),
          kitWithProps(fieldsView, {
            label: `$root.props.showLabel`,
            sticker: `$root.props.showSticker`
          })
        ],
      },
    ],
  };

  export const listItem: FrameRoot = {
    def: {
      id: 'rowItem',
        type: 'listItem'
    },
    node: {
      type: "group",
      id: "$root",
      schemaId: "$root",
      name: "List View",
      rank: 0,
      props: {
        _selected: `$root.props._selectedIndexes?.some(f => f == $contexts.$context['_index'])`,
        previewField: `'Created'`,
        prefixField: ``,
        subtitleField: ``,
        _selectedIndexes: '[]',
      },
      styles: {
        layout: `"row"`,
        gap: `'12px'`,
        sem: `'listItem'`,
        padding: `'4px'`,
        overflow: `'hidden'`,
        width: `'100%'`,
        layoutAlign: `'n'`,
      },
      interactions: {
      onClick: 'select',
      onDoubleClick: 'open',
      onContextMenu: 'contextMenu',
    },
      types: {
        previewField: "option",
        prefixField: "option",
        subtitleField: "option",
      },
      propsValue: {
        previewField: {
          alias: i18n.labels.status,
          source: `$properties`
        },
        subtitleField: {
          alias: i18n.labels.subtitle,
          source: `$properties`
        },
        prefixField: {
          alias: i18n.labels.prefix,
          source: `$properties`
        }
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
                      sem: `'listItem-selected'`,
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
                      sem: `'listItem'`,
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
      frameRootWithProps(
        {...groupNode, children: [frameRootWithProps(dataNode, {
            field: `$contexts.$context._properties?.find(f => f.name == $root.props['prefixField'])`,
            value: `$contexts[$contexts.$context['_path']]?.[$root.props.prefixField]`,
          }, {
            "--font-text-size": `'12px'`,
            "--font-text-color": `'var(--mk-ui-text-tertiary)'`,
          }),]}, {}, {
            width: `'120px'`,
            hidden: `!($root.props.prefixField?.length > 0)`,
            height: `'32px'`,
            layout: `'row'`,
            layoutAlign: `'w'`
          }
      ),
      
      kitWithProps(previewNode(), {
        path: `$contexts.$context['_keyValue']`,
        width: `'32px'`,
        height: `'32px'`,
        padding: `'8px'`,
        radius: `'4px'`
      }, {
        borderRadius: `'4px'`,
        background: `'var(--background-secondary)'`,
        hidden:  `!$contexts.$context['_isContext']`,

      }
      ),
      {
        ...groupNode,
        node: {
          ...groupNode.node,
          styles: {
            flex: `'1'`,
            layout: `'column'`,
            layoutAlign: `'w'`,
            height: `'auto'`
          },
        },
        children: [
          {
            ...groupNode,
            node: {
              ...groupNode.node,
              styles: {
                gap: `'8px'`,
                layout: `'row'`,
                layoutAlign: `'w'`,
                height: `'32px'`,
                width: `'100%'`,
              },
            },
            children:[
          frameRootWithProps(
            textNode,
            {
              value: `$contexts.$context['_name']`,
            },
            {
              "--font-text-size": `'16px'`,
              "--font-text-weight": `'var(--bold-weight)'`,
              width: `'auto'`
            }
          ),
          frameRootWithProps(groupNode, {}, {
            "flex": `'1'`,
            height: `'auto'`,
          }),
          frameRootWithProps(dataNode, {
            field: `$contexts.$context._properties?.find(f => f.name == $root.props['previewField'])`,
            value: `$contexts[$contexts.$context['_path']]?.[$root.props.previewField]`,
          }, {
            "--font-text-color": `'var(--mk-ui-text-tertiary)'`,
          }),
        ],
      }, frameRootWithProps(dataNode, {
            field: `$contexts.$context._properties?.find(f => f.name == $root.props['subtitleField'])`,
            value: `$contexts[$contexts.$context['_path']]?.[$root.props.subtitleField]`,
          }, {
            "--font-text-color": `'var(--mk-ui-text-tertiary)'`,
            "--font-text-size": `'12px'`
          }),],
      },
      
    ],
  }

