import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { logger } from '../config/logger';

export const listAdvisories = async (req: Request, res: Response): Promise<void> => {
  try {
    const { county, category, page = '1', limit = '20' } = req.query as Record<string, string>;
    const where: Record<string, unknown> = { isPublished: true };
    if (county) where.county = { in: [county, 'National', null] };
    if (category) where.category = category;

    const [advisories, total] = await Promise.all([
      prisma.advisory.findMany({
        where,
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
        orderBy: { publishedAt: 'desc' },
        include: { officer: { select: { firstName: true, lastName: true, profilePhoto: true } } },
      }),
      prisma.advisory.count({ where }),
    ]);
    res.json({ success: true, data: { advisories, total } });
  } catch (err) {
    logger.error('List advisories error', err);
    res.status(500).json({ success: false, message: 'Failed to fetch advisories' });
  }
};

export const getAdvisory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const advisory = await prisma.advisory.findUnique({
      where: { id },
      include: { officer: { select: { firstName: true, lastName: true, profilePhoto: true } } },
    });
    if (!advisory) { res.status(404).json({ success: false, message: 'Advisory not found' }); return; }
    await prisma.advisory.update({ where: { id }, data: { viewCount: { increment: 1 } } });
    res.json({ success: true, data: advisory });
  } catch (err) {
    logger.error('Get advisory error', err);
    res.status(500).json({ success: false, message: 'Failed to fetch advisory' });
  }
};

export const createAdvisory = async (req: Request, res: Response): Promise<void> => {
  try {
    const officerId = req.user!.userId;
    const { title, content, category, county, severity, tags, isPublished } = req.body;
    const advisory = await prisma.advisory.create({
      data: {
        officerId, title, content, category,
        county: county || null,
        severity: severity || 'INFO',
        tags: Array.isArray(tags) ? tags : [],
        isPublished: isPublished === true,
        publishedAt: isPublished ? new Date() : null,
      },
    });
    res.status(201).json({ success: true, data: advisory });
  } catch (err) {
    logger.error('Create advisory error', err);
    res.status(500).json({ success: false, message: 'Failed to create advisory' });
  }
};

export const updateAdvisory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updated = await prisma.advisory.update({ where: { id }, data: req.body });
    res.json({ success: true, data: updated });
  } catch (err) {
    logger.error('Update advisory error', err);
    res.status(500).json({ success: false, message: 'Failed to update advisory' });
  }
};

export const listKnowledgeArticles = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, page = '1', limit = '20', search } = req.query as Record<string, string>;
    const where: Record<string, unknown> = { isPublished: true };
    if (category) where.category = category;
    if (search) where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { content: { contains: search, mode: 'insensitive' } },
      { tags: { has: search } },
    ];

    const [articles, total] = await Promise.all([
      prisma.knowledgeArticle.findMany({
        where,
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
        orderBy: { publishedAt: 'desc' },
        select: { id: true, title: true, summary: true, category: true, tags: true, mediaUrls: true, viewCount: true, publishedAt: true, author: { select: { firstName: true, lastName: true } } },
      }),
      prisma.knowledgeArticle.count({ where }),
    ]);
    res.json({ success: true, data: { articles, total } });
  } catch (err) {
    logger.error('List knowledge articles error', err);
    res.status(500).json({ success: false, message: 'Failed to fetch articles' });
  }
};

export const getKnowledgeArticle = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const article = await prisma.knowledgeArticle.findUnique({
      where: { id },
      include: { author: { select: { firstName: true, lastName: true, profilePhoto: true } } },
    });
    if (!article) { res.status(404).json({ success: false, message: 'Article not found' }); return; }
    await prisma.knowledgeArticle.update({ where: { id }, data: { viewCount: { increment: 1 } } });
    res.json({ success: true, data: article });
  } catch (err) {
    logger.error('Get knowledge article error', err);
    res.status(500).json({ success: false, message: 'Failed to fetch article' });
  }
};
