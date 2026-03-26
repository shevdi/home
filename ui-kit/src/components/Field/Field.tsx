import { FieldControl } from './FieldControl'
import { FieldDescription } from './FieldDescription'
import { FieldError } from './FieldError'
import { FieldLabel } from './FieldLabel'
import { FieldRoot } from './FieldRoot'
import { FieldShorthand } from './FieldShorthand'

export const Field = Object.assign(FieldShorthand, {
  Root: FieldRoot,
  Label: FieldLabel,
  Control: FieldControl,
  Description: FieldDescription,
  Error: FieldError,
})
