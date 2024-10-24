// activity feed
import { type PoW } from '@prisma/client';
import { type NextApiRequest, type NextApiResponse } from 'next';

import logger from '@/lib/logger';
import { prisma } from '@/prisma';
import { dayjs } from '@/utils/dayjs';
import { safeStringify } from '@/utils/safeStringify';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  logger.debug(`Request query: ${safeStringify(req.query)}`);
  const { timePeriod, take = 15, skip = 0, isWinner, filter } = req.query;

  try {
    const winnerFilter =
      isWinner === 'true'
        ? {
            AND: [
              { isWinner: true },
              { listing: { isWinnersAnnounced: true } },
            ],
          }
        : {};

    let startDate: Date;
    const endDate: Date = new Date();

    switch (timePeriod) {
      case 'this week':
        startDate = dayjs().subtract(7, 'day').toDate();
        break;
      case 'this month':
        startDate = dayjs().subtract(30, 'day').toDate();
        break;
      case 'this year':
        startDate = dayjs().subtract(365, 'day').toDate();
        break;
      default:
        startDate = dayjs().subtract(30, 'day').toDate();
        break;
    }

    logger.debug(`Fetching submissions from ${startDate} to ${endDate}`);
    const submissions = await prisma.submission.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        ...winnerFilter,
        listing: {
          isPrivate: false,
        },
      },
      skip: parseInt(skip as string, 10),
      take: parseInt(take as string, 10),
      orderBy:
        filter === 'popular'
          ? [{ likeCount: 'desc' }, { createdAt: 'desc' }]
          : { createdAt: 'desc' },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            photo: true,
            username: true,
          },
        },
        listing: {
          select: {
            id: true,
            title: true,
            rewards: true,
            type: true,
            slug: true,
            isWinnersAnnounced: true,
            token: true,
            sponsor: {
              select: {
                name: true,
                logo: true,
              },
            },
            winnersAnnouncedAt: true,
          },
        },
      },
    });

    logger.debug('Fetching PoWs');
    let pow: (PoW & {
      user: {
        firstName: string | null;
        lastName: string | null;
        photo: string | null;
        username: string | null;
      };
    })[] = [];
    if (isWinner !== 'true') {
      pow = await prisma.poW.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        skip: parseInt(skip as string, 10),
        take: parseInt(take as string, 10),
        orderBy:
          filter === 'popular'
            ? [{ likeCount: 'desc' }, { createdAt: 'desc' }]
            : { createdAt: 'desc' },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              photo: true,
              username: true,
            },
          },
        },
      });
    }

    logger.debug(`Fetching grants from ${startDate} to ${endDate}`);
    const grantApplications = await prisma.grantApplication.findMany({
      where: {
        applicationStatus: 'Approved',
        decidedAt: {
          gte: startDate,
          lte: endDate,
        },
        grant: {
          // isPrivate: false,
        },
      },
      skip: parseInt(skip as string, 10),
      take: parseInt(take as string, 10),
      orderBy:
        filter === 'popular'
          ? [
              // { approvedAmount: 'desc' },
              { decidedAt: 'desc' },
            ]
          : { decidedAt: 'desc' },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            photo: true,
            username: true,
          },
        },
        grant: {
          select: {
            id: true,
            title: true,
            slug: true,
            token: true,
            sponsor: {
              select: {
                name: true,
                logo: true,
              },
            },
          },
        },
      },
    });

    logger.info(
      `Fetched ${submissions.length} submissions, ${pow.length} PoWs and ${grantApplications} grant applications`,
    );

    const results = [
      ...submissions.map((sub) => ({
        id: sub.listing.isWinnersAnnounced ? sub.id : null,
        createdAt:
          sub.isWinner &&
          sub.listing.isWinnersAnnounced &&
          sub.listing.winnersAnnouncedAt
            ? sub.listing.winnersAnnouncedAt
            : sub.createdAt,
        link: sub.listing.isWinnersAnnounced ? sub.link : null,
        tweet: sub.listing.isWinnersAnnounced ? sub.tweet : null,
        otherInfo: sub.listing.isWinnersAnnounced ? sub.otherInfo : null,
        isWinner: sub.listing.isWinnersAnnounced ? sub.isWinner : null,
        winnerPosition: sub.listing.isWinnersAnnounced
          ? sub.winnerPosition
          : null,
        firstName: sub.user.firstName,
        lastName: sub.user.lastName,
        photo: sub.user.photo,
        username: sub.user.username,
        listingId: sub.listing.id,
        listingTitle: sub.listing.title,
        rewards: sub.listing.rewards,
        listingType: sub.listing.type,
        listingSlug: sub.listing.slug,
        isWinnersAnnounced: sub.listing.isWinnersAnnounced,
        token: sub.listing.token,
        sponsorName: sub.listing.sponsor.name,
        sponsorLogo: sub.listing.sponsor.logo,
        type: 'Submission',
        like: sub.like,
        likeCount: sub.likeCount,
        ogImage: sub.ogImage,
      })),
      ...pow.map((pow) => ({
        id: pow.id,
        createdAt: pow.createdAt,
        description: pow.description,
        title: pow.title,
        firstName: pow.user.firstName,
        lastName: pow.user.lastName,
        photo: pow.user.photo,
        username: pow.user.username,
        type: 'PoW',
        link: pow.link,
        like: pow.like,
        likeCount: pow.likeCount,
        ogImage: pow.ogImage,
      })),
      ...grantApplications.map((ga) => ({
        id: ga.id,
        createdAt: ga.decidedAt || ga.createdAt,
        firstName: ga.user.firstName,
        lastName: ga.user.lastName,
        photo: ga.user.photo,
        username: ga.user.username,
        listingId: ga.grant.id,
        listingTitle: ga.grant.title,
        listingSlug: ga.grant.slug,
        token: ga.grant.token,
        sponsorName: ga.grant.sponsor.name,
        sponsorLogo: ga.grant.sponsor.logo,
        type: 'Grant',
        grantApplicationAmount: ga.approvedAmount,
        like: ga.like,
        likeCount: ga.likeCount,
      })),
    ];

    results.sort((a, b) => {
      if (filter === 'popular') {
        if (a.likeCount === b.likeCount) {
          return b.createdAt.getTime() - a.createdAt.getTime();
        }
        return b.likeCount - a.likeCount;
      } else {
        return b.createdAt.getTime() - a.createdAt.getTime();
      }
    });

    res.status(200).json(results);
  } catch (error: any) {
    logger.error(
      `Error occurred while fetching submissions and PoWs: ${safeStringify(error)}`,
    );
    res.status(500).json({ error: `Unable to fetch data: ${error.message}` });
  }
}
