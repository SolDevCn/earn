import { HStack, Text, VStack } from '@chakra-ui/react';
import { useTranslation } from 'next-i18next';

import PiedPiper from '@/public/assets/landingsponsor/sponsors/piedPiper.webp';

import { HighQualityImage } from '../HighQualityImage';

export function StepOne() {
  const { t } = useTranslation('common');

  return (
    <VStack
      align="start"
      gap={4}
      w="21.5rem"
      h="18.75rem"
      p={4}
      bg="white"
      border="1px solid"
      borderColor="brand.slate.200"
      shadow={'0px 4px 6px 0px rgba(226, 232, 240, 0.41)'}
      rounded={6}
    >
      <HStack gap={4} w="100%">
        <HighQualityImage
          alt={t('stepOne.piedPiperLogoAlt')}
          width={49}
          src={PiedPiper}
        />
        <VStack align="start" flexGrow={1} w="100%">
          <Text color="brand.slate.400" fontSize="sm" fontWeight="500">
            {t('stepOne.companyName')}
          </Text>
          <Text
            w="100%"
            px={2}
            py={1}
            color="brand.slate.700"
            fontSize="sm"
            fontWeight={500}
            bg="brand.slate.50"
            border="1px solid"
            borderColor="brand.slate.200"
          >
            {t('stepOne.piedPiper')}
          </Text>
        </VStack>
      </HStack>
      <VStack align="start" flexGrow={1} w="100%">
        <Text color="brand.slate.400" fontSize="sm" fontWeight="500">
          {t('stepOne.websiteURL')}
        </Text>
        <Text
          w="100%"
          px={2}
          py={1}
          color="brand.slate.700"
          fontSize="sm"
          fontWeight={500}
          bg="brand.slate.50"
          border="1px solid"
          borderColor="brand.slate.200"
        >
          {t('stepOne.piedPiperWebsite')}
        </Text>
      </VStack>
      <VStack align="start" flexGrow={1} w="100%">
        <Text color="brand.slate.400" fontSize="sm" fontWeight="500">
          {t('stepOne.twitterHandle')}
        </Text>
        <Text
          w="100%"
          px={2}
          py={1}
          color="brand.slate.700"
          fontSize="sm"
          fontWeight={500}
          bg="brand.slate.50"
          border="1px solid"
          borderColor="brand.slate.200"
        >
          {t('stepOne.piedPiperTwitter')}
        </Text>
      </VStack>
      <Text
        alignSelf="end"
        px={4}
        py={2}
        color="brand.purple"
        fontSize="sm"
        fontWeight={500}
        bg="#EEF2FF"
        rounded={7}
      >
        {t('stepOne.createProfile')}
      </Text>
    </VStack>
  );
}
