import { Controller } from 'react-hook-form'
import type { Control, FieldValues, Path, UseFormTrigger } from 'react-hook-form'
import { TaggedInput } from '@shevdi-home/ui-kit'
import type { TaggedInputProps } from '@shevdi-home/ui-kit'

export type RhfTaggedInputProps<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>
  trigger: UseFormTrigger<TFieldValues>
  tagsName: Path<TFieldValues>
  inputName: Path<TFieldValues>
  /** Resolver validation target after the tag list changes; defaults to `tagsName`. */
  validatesFieldName?: Path<TFieldValues>
  /** Runs after the tag list is written to the form and validation is triggered. */
  onAfterTagsChange?: (next: string[]) => void
} & Omit<TaggedInputProps, 'tags' | 'onTagsChange' | 'inputValue' | 'onInputValueChange'>

export function RhfTaggedInput<TFieldValues extends FieldValues>({
  control,
  trigger,
  tagsName,
  inputName,
  validatesFieldName,
  onAfterTagsChange,
  ...rest
}: RhfTaggedInputProps<TFieldValues>) {
  const fieldToValidate = validatesFieldName ?? tagsName
  return (
    <Controller
      control={control}
      name={tagsName}
      render={({ field: tagsField }) => (
        <Controller
          control={control}
          name={inputName}
          render={({ field: inputField }) => (
            <TaggedInput
              {...rest}
              tags={(tagsField.value as string[]) ?? []}
              onTagsChange={(next) => {
                tagsField.onChange(next)
                void trigger(fieldToValidate)
                onAfterTagsChange?.(next)
              }}
              inputValue={(inputField.value as string | undefined) ?? ''}
              onInputValueChange={inputField.onChange}
            />
          )}
        />
      )}
    />
  )
}
