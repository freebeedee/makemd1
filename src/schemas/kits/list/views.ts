import i18n from "shared/i18n";

import { frameRootWithProps, kitWithProps } from "core/utils/frames/frames";
import { FrameRoot } from "shared/types/mframe";
import { contentNode, dataNode, flowNode, groupNode, iconNode, imageNode, inputNode, textNode } from "../base";
import { deltaNode, slideNode, slidesNode } from "../slides";
import { checkboxNode, listItemNode, listNode, previewNode } from "../ui";

export const fieldsView: FrameRoot = {
  id: 'fieldsView',
  def: {
    id: 'fieldsView',
  },
  node: {
    schemaId: 'fieldsView',
    parentId: "",
    name: i18n.menu.properties,
    rank: 0,
    id: 'fieldsView',
    type: 'group',
    props: {
      label: 'true',
      sticker: 'true'
    },
    types: {
      label: 'boolean',
      sticker: 'boolean'
    }
  },
  children: [frameRootWithProps({...listNode(), children: [
    frameRootWithProps({...listItemNode(), children: [
      frameRootWithProps(dataNode, {
        field: 'listItem.props.value',
        value: '$contexts[listItem.props.value.table?.length > 0 ? listItem.props.value.table : $contexts.$context._path]?.[listItem.props.value.name]'
      }, {
        '--mk-label': `$root.props.label`,
        '--mk-sticker': `$root.props.sticker`
      })
    ]}, {}, {
      layout: `'row'`,
      gap: `'8px'`,
      hidden: '!($contexts[listItem.props.value.table?.length > 0 ? listItem.props.value.table : $contexts.$context._path]?.[listItem.props.value.name]?.length > 0)'
    })
  ]}, {
    value: `$contexts.$context._properties?.filter(f => f.primary != 'true' && !f.type.startsWith('object')) ?? []`
  }, {
    layout: `'column'`,
    gap: `'8px'`
  })]
}
