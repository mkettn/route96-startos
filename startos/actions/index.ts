import { sdk } from '../sdk'
import { setPublicUrl } from './setPublicUrl'
import { editSettings } from './editSettings'

export const actions = sdk.Actions.of()
  .addAction(setPublicUrl)
  .addAction(editSettings)
