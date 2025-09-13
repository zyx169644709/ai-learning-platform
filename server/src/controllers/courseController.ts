import { Request, Response } from 'express'
import { courseService } from '../services/courseService'

export const listCourses = async (_req: Request, res: Response) => {
  const items = await courseService.list()
  res.json(items)
}

export const getCourse = async (req: Request, res: Response) => {
  const item = await courseService.get(req.params.id)
  if (!item) return res.status(404).json({ message: 'Not Found' })
  res.json(item)
}

export const createCourse = async (req: Request, res: Response) => {
  const { title, url } = req.body || {}
  if (!title || !url) return res.status(400).json({ message: 'title and url required' })
  const item = await courseService.create(req.body)
  res.status(201).json(item)
}

export const updateCourse = async (req: Request, res: Response) => {
  try {
    const item = await courseService.update(req.params.id, req.body)
    res.json(item)
  } catch {
    res.status(404).json({ message: 'Not Found' })
  }
}

export const deleteCourse = async (req: Request, res: Response) => {
  try {
    await courseService.remove(req.params.id)
    res.json({ success: true })
  } catch {
    res.status(404).json({ message: 'Not Found' })
  }
}


