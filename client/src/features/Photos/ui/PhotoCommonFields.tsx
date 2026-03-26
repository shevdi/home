import type { CSSProperties } from 'react'
import styled from 'styled-components'
import type { Control, FieldValues, Path, UseFormRegister, UseFormTrigger } from 'react-hook-form'
import { Controller } from 'react-hook-form'
import { Checkbox, Field, Input, RhfTaggedInput } from '@/shared/ui'
import type { PhotoCommonFormValues } from '../utils/photoCommonForm'

/** Matches ui-kit `sm` density for Field labels / descriptions / errors. */
const smallFormDensity: CSSProperties = {
  ['--font-size-label' as string]: '0.78rem',
  ['--font-size-field-error' as string]: '0.72rem',
  ['--font-size-field-description' as string]: '0.8rem',
}

type PhotoCommonFieldsProps<T extends PhotoCommonFormValues & FieldValues> = {
  control: Control<T>
  register: UseFormRegister<T>
  trigger: UseFormTrigger<T>
  disabled?: boolean
  privateLabel: string
}

export function PhotoCommonFields<T extends PhotoCommonFormValues & FieldValues>({
  control,
  register,
  trigger,
  disabled = false,
  privateLabel,
}: PhotoCommonFieldsProps<T>) {
  return (
    <SmallFormRoot style={smallFormDensity}>
      <Controller
        control={control}
        name={'private' as Path<T>}
        render={({ field }) => (
          <Checkbox
            checked={!!field.value}
            onChange={field.onChange}
            label={privateLabel}
            disabled={disabled}
            size='sm'
          />
        )}
      />
      <FieldsWrapper>
        <Field label='Заголовок'>
          <Input {...register('title' as Path<T>)} disabled={disabled} id='photo-form-title' size='sm' />
        </Field>
        <Field label='Приоритет'>
          <Input
            {...register('priority' as Path<T>, {
              setValueAs: (v) => {
                if (v === '' || v === null || v === undefined) return 0
                const n = typeof v === 'number' ? v : Number(v)
                return Number.isFinite(n) ? n : 0
              },
            })}
            type='number'
            disabled={disabled}
            id='photo-form-priority'
            size='sm'
          />
        </Field>
        <Field label='Страна'>
          <RhfTaggedInput<T>
            control={control}
            trigger={trigger}
            tagsName={'country' as Path<T>}
            inputName={'countryInput' as Path<T>}
            id='photo-form-country'
            placeholder='Введите страну и нажмите Enter'
            insertAt='start'
            disabled={disabled}
            size='sm'
          />
        </Field>
        <Field label='Город'>
          <RhfTaggedInput<T>
            control={control}
            trigger={trigger}
            tagsName={'city' as Path<T>}
            inputName={'cityInput' as Path<T>}
            id='photo-form-city'
            placeholder='Введите город и нажмите Enter'
            insertAt='start'
            disabled={disabled}
            size='sm'
          />
        </Field>
        <Field label='Теги'>
          <RhfTaggedInput<T>
            control={control}
            trigger={trigger}
            tagsName={'tags' as Path<T>}
            inputName={'tagInput' as Path<T>}
            id='photo-form-tags'
            placeholder='Введите тег и нажмите Enter'
            disabled={disabled}
            size='sm'
          />
        </Field>
      </FieldsWrapper>
    </SmallFormRoot>
  )
}

const SmallFormRoot = styled.div``

const FieldsWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem 1.25rem;
`
