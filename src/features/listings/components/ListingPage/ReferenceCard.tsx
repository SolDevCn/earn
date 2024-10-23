import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Text,
  VStack,
} from '@chakra-ui/react';
import { type FieldErrors, type UseFormRegister } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { type References } from '../../types';

interface PropFields {
  description: string;
  requirements?: string;
  references?: References[];
}

interface Props {
  register: UseFormRegister<PropFields>;
  index: number;
  errors: FieldErrors<PropFields>;
}

export const ReferenceCard = ({ register, index, errors }: Props) => {
  const { t } = useTranslation();

  return (
    <VStack align={'start'} w={'full'}>
      <FormControl w={'full'} isInvalid={!!errors.references?.[index]?.link}>
        <FormLabel color={'gray.500'}>
          <Text color={'gray.500'} fontSize={'0.88rem'} fontWeight={600}>
            {t('ReferenceCard.referenceNumber', { index: index + 1 })}
          </Text>
        </FormLabel>
        <Input
          {...register(`references.${index}.link`)}
          borderColor="brand.slate.300"
          _placeholder={{
            color: 'brand.slate.300',
          }}
          focusBorderColor="brand.purple"
          placeholder={t('ReferenceCard.enterReferenceLinkPlaceholder')}
        />
        <FormErrorMessage>
          {errors.references?.[index]?.link?.message}
        </FormErrorMessage>
      </FormControl>
    </VStack>
  );
};
