import { Request, Response } from 'express'
import { resourceService } from '../services/resourceService'

export const listResources = async (_req: Request, res: Response) => {
  const items = await resourceService.list()
  res.json(items)
}

export const getResource = async (req: Request, res: Response) => {
  const item = await resourceService.get(req.params.id)
  if (!item) return res.status(404).json({ message: 'Not Found' })
  res.json(item)
}

export const createResource = async (req: Request, res: Response) => {
  const { title, description, url, tags, cover } = req.body || {}
  if (!title || !url) return res.status(400).json({ message: 'title and url required' })
  const item = await resourceService.create({ title, description, url, tags, cover })
  res.status(201).json(item)
}

export const updateResource = async (req: Request, res: Response) => {
  const item = await resourceService.update(req.params.id, req.body || {})
  if (!item) return res.status(404).json({ message: 'Not Found' })
  res.json(item)
}

export const deleteResource = async (req: Request, res: Response) => {
  await resourceService.remove(req.params.id)
  res.json({ success: true })
}


