import { frameRootWithProps } from "core/utils/frames/frames";
import { FrameRoot } from "shared/types/mframe";
import { groupNode, listNode } from "../base";
import { listItemNode } from "../ui";

  export const listGroup: FrameRoot = {
    def: {
      id: 'listGroup',
        type: 'listGroup'
    },
    node: {
      type: "group",
      props: {
        _groupField: ``,
        _groupValue: ``,
        _readMode: 'false',
        showNew: 'true'
      },
      types: {
        _groupField: "object",
        _groupValue: "text",
        _readMode: 'boolean',
        showNew: "boolean"
      },
      propsValue: {
        showNew: {
          alias: i18n.labels.showNewItemButton,
        }
      },
      styles:{
        sem: `'contextGroup'`
      },
      id: "$root",
      schemaId: "$root",
      name: i18n.labels.rows,
      rank: 0,
    },
    id: "$root",
    children: [
      frameRootWithProps(dataNode, {
        field: `$root.props['_groupField']`,
        value: `$root.props['_groupValue']`,
      }),
     frameRootWithProps(contentNode, {
     }, {
        layout: `'column'`,
        alignItems: `'stretch'`,
     }),
     kitWithProps(newItemNode, {
      space: `$contexts.$context['_path']`,
      schema: `$contexts.$context['_schema']`,
      key: `$contexts.$context['_key']`,
      group: `$root.props['_groupField']?.name`,
        groupValue: `$root.props['_groupValue']`,
     }, {
      hidden: `!$root.props['showNew'] || $root.props['_readMode']`
     })
    ],
  };

  

  export const columnGroup: FrameRoot = {
    def: {
      id: 'columnGroup',
        type: 'listGroup'
    },
    node: {
      type: "group",
      props: {
        _groupField: ``,
        _groupValue: ``,
        _readMode: 'false',
        showNew: 'true'
      },
      types: {
        _groupField: "object",
        _groupValue: "text",
        _readMode: 'boolean',
        showNew: "boolean"
      },
      propsValue: {
        showNew: {
          alias: i18n.labels.showNewItemButton,
        }
      },
      styles: {
        layout: `'column'`,
        width: `'262px'`,
        background: `'var(--mk-ui-background-variant)'`,
        borderRadius: `'8px'`,
        gap: `'8px'`,
        padding:`'6px'`
      },
      id: "$root",
      schemaId: "$root",
      name: i18n.labels.columns,
      rank: 0,
        
    },
    id: "$root",
    children: [
      frameRootWithProps(dataNode, {
        field: `$root.props['_groupField']`,
        value: `$root.props['_groupValue']`,
      }),
      frameRootWithProps(
      contentNode,
      {
      },
      {
        gap: `'8px'`,
        layout: `'column'`,
        width: `'100%'`,
        alignItems: `'stretch'`

      }
      ),
      kitWithProps(newItemButton, {
         space: `$contexts.$context['_path']`,
      schema: `$contexts.$context['_schema']`,
      group: `$root.props['_groupField']?.name`,
        groupValue: `$root.props['_groupValue']`,
      },
      {
        hidden: `!$root.props['showNew'] || $root.props['_readMode']`
      })
      
    ],
  };

  export const rowGroup: FrameRoot = {
    def: {
      id: 'rowGroup',
        type: 'listGroup'
    },
    node: {
      type: "group",
      props: {
        _groupField: ``,
        _groupValue: ``,
      },
      types: {
        _groupField: "object",
        _groupValue: "text",
      },
      styles: {
        layout: `'column'`,
        padding:`'6px'`,
        gap: `'8px'`,
        sem: `'contextGroup'`
      },
      id: "$root",
      schemaId: "$root",
      name: "Catalog Group",
      rank: 0,
        
    },
    id: "$root",
    children: [
      frameRootWithProps(dataNode, {
        field: `$root.props['_groupField']`,
        value: `$root.props['_groupValue']`,
      }),
      frameRootWithProps(
      contentNode,
      {
      },
      {
        gap: `'8px'`,
        layout: `'row'`,
        width: `'100%'`,
        overflow: `'scroll'`
      }
      ),
      
      
    ],
  };

  export const gridGroup: FrameRoot = {
    def: {
      id: 'gridGroup',
        type: 'listGroup'
    },
    node: {
      type: "group",
      props: {
        _groupField: ``,
        _groupValue: ``,
      },
      types: {
        _groupField: "object",
        _groupValue: "text",
      },
      styles: {
        layout: `'column'`,
        padding:`'6px'`,
        gap: `'8px'`,
        sem: `'contextGroup'`
      },
      id: "$root",
      schemaId: "$root",
      name: "Grid Group",
      rank: 0,
        
    },
    id: "$root",
    children: [
      frameRootWithProps(dataNode, {
        field: `$root.props['_groupField']`,
        value: `$root.props['_groupValue']`,
      }),
      frameRootWithProps(
      contentNode,
      {
      },
      {
        gap: `'8px'`,
        layout: `'grid'`,
        width: `'100%'`,
        "--mk-grid-columns": `'auto-fill'`,
        "--mk-grid-width": `'250px'`
      }
      ),
      
      
    ],
  };

  export const masonryGroup: FrameRoot = {
    def: {
      id: 'masonryGroup',
        type: 'listGroup'
    },
    node: {
      type: "group",
      props: {},
      id: "$root",
      schemaId: "$root",
      name: i18n.labels.masonry,
      rank: 0,
        styles: {
          layout: `'column'`,
          sem: `'contextGroup'`
        }
    },
    id: "$root",
    children: [
      frameRootWithProps(dataNode, {
        field: `$root.props['_groupField']`,
        value: `$root.props['_groupValue']`,
      }),
      frameRootWithProps(
      contentNode,
      {
      },
      {
        padding: `'8px'`,
        layout: `'masonry'`,
      }
      )
    ],
  };


  export const listView: FrameRoot = {
    def: {
      id: 'listView',
        type: 'listView'
    },
    node: {
      type: "group",
      props: {},
      styles: {
        sem: `'contextView'`
      },
      id: "$root",
      schemaId: "$root",
      name: "List View",
      rank: 0,
    },
    id: "$root",
    children: [
      
      contentNode,
    ],
  };

  

  export const columnView: FrameRoot = {
    def: {
      id: 'columnView',
        type: 'listView'
    },
    node: {
      type: "group",
      props: {},
      id: "$root",
      styles: {
        sem: `'contextView'`
      },
      schemaId: "$root",
      name: "Column View",
      rank: 0,
    },
    id: "$root",
    children: [
      
      frameRootWithProps(contentNode,{},
      {
        padding: `'8px'`,
        layout: `'row'`,
        gap: `'8px'`,
      }),
    ],
