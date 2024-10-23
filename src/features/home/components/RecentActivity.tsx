import { ArrowForwardIcon } from '@chakra-ui/icons';
import { Box, Flex, Text } from '@chakra-ui/react';
import NextLink from 'next/link';
import { usePostHog } from 'posthog-js/react';
import { useTranslation } from 'react-i18next';

import { OgImageViewer } from '@/components/shared/ogImageViewer';
import { useGetFeed } from '@/features/feed';
import { timeAgoShort } from '@/utils/timeAgo';

interface ActivityCardProps {
  firstName: string;
  lastName: string;
  username: string;
  createdAt: string;
  link: string;
  listingType: 'bounty' | 'hackathon' | 'project';
  isWinner: boolean;
  isWinnersAnnounced: boolean;
  type: string;
  ogImage: string;
}

const ActivityCard = ({
  firstName,
  lastName,
  username,
  createdAt,
  link,
  listingType,
  isWinner,
  isWinnersAnnounced,
  type,
  ogImage,
}: ActivityCardProps) => {
  const { t } = useTranslation();

  const getActionText = () => {
    const defaultActionText = {
      bounty: t('RecentActivity.justSubmittedBounty'),
      hackathon: t('RecentActivity.justSubmittedHackathon'),
      project: t('RecentActivity.justAppliedProject'),
    };

    const winnerActionText = {
      bounty: t('RecentActivity.justWonBounty'),
      hackathon: t('RecentActivity.justWonHackathonTrack'),
      project: t('RecentActivity.justSelectedProject'),
    };

    if (type === 'PoW') {
      return t('RecentActivity.justAddedPersonalProject');
    } else if (isWinner && isWinnersAnnounced) {
      return (
        winnerActionText[listingType] ||
        t('RecentActivity.justAchievedSomethingGreat')
      );
    } else {
      return (
        defaultActionText[listingType] || t('RecentActivity.justTookAction')
      );
    }
  };

  const actionText = getActionText();

  return (
    <Flex as={NextLink} href={'/feed/?filter=new'}>
      <OgImageViewer
        h={12}
        w={20}
        objectFit={'cover'}
        externalUrl={link}
        imageUrl={ogImage}
      />
      <Box ml={3}>
        <Flex align={'center'}>
          <Text
            overflow={'hidden'}
            maxW={32}
            mr={1.5}
            color={'brand.slate.800'}
            fontSize={'0.9rem'}
            fontWeight={600}
            whiteSpace={'nowrap'}
            textOverflow={'ellipsis'}
          >
            {firstName} {lastName}
          </Text>
          <Text
            overflow={'hidden'}
            maxW={'5.7rem'}
            color={'brand.slate.400'}
            fontSize={'sm'}
            fontWeight={500}
            whiteSpace={'nowrap'}
            textOverflow={'ellipsis'}
          >
            @{username}
          </Text>
          <Text mx={1} color="brand.slate.400" fontSize={'xs'}>
            •
          </Text>
          <Text color={'brand.slate.400'} fontSize={'xs'}>
            {timeAgoShort(createdAt)}
          </Text>
        </Flex>
        <Text color={'brand.slate.600'} fontSize={'sm'} fontWeight={500}>
          {actionText}
        </Text>
      </Box>
    </Flex>
  );
};

export const RecentActivity = () => {
  const { t } = useTranslation();
  const posthog = usePostHog();

  const { data } = useGetFeed({ take: 5 });

  const activity = data?.pages[0] ?? [];

  return (
    <Box>
      <Flex align="center" justify={'space-between'}>
        <Text color={'gray.400'} fontSize={'sm'} fontWeight={500}>
          {t('RecentActivity.recentActivity')}
        </Text>
        <Text
          className="ph-no-capture"
          as={NextLink}
          color="brand.purple"
          fontSize="xs"
          fontWeight={600}
          href="/feed"
          onClick={() => {
            posthog.capture('recent winners_view all_homepage');
          }}
        >
          {t('RecentActivity.viewAll')}
          <ArrowForwardIcon ml={1} />
        </Text>
      </Flex>
      <Flex direction={'column'} rowGap={'1rem'} w={'full'} mt={4}>
        {activity.map((act, i) => {
          return (
            <ActivityCard
              key={i}
              link={act.link}
              firstName={act.firstName}
              lastName={act.lastName}
              username={act.username}
              createdAt={act.createdAt}
              listingType={act.listingType}
              isWinner={act.isWinner}
              isWinnersAnnounced={act.isWinnersAnnounced}
              type={act.type}
              ogImage={act.ogImage}
            />
          );
        })}
      </Flex>
    </Box>
  );
};
