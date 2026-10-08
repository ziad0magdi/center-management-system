import { GroupService } from '../services/group.service.js';

export const GroupController = {
  async getAll(req, res, next) {
    try {
      const { teacher_id, is_active } = req.query;
      const groups = await GroupService.getAllGroups({
        teacherId: teacher_id,
        isActive: is_active
      });
      res.status(200).json({ success: true, data: groups });
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const group = await GroupService.getGroupById(req.params.id);
      res.status(200).json({ success: true, data: group });
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const created = await GroupService.createGroup(req.body);
      res.status(201).json({ success: true, message: 'Group created successfully', data: created });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  },

  async update(req, res, next) {
    try {
      const updated = await GroupService.updateGroup(req.params.id, req.body);
      res.status(200).json({ success: true, message: 'Group updated successfully', data: updated });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  },

  async delete(req, res, next) {
    try {
      const result = await GroupService.deleteGroup(req.params.id);
      res.status(200).json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  },

  async getStudents(req, res, next) {
    try {
      const students = await GroupService.getGroupStudents(req.params.id);
      res.status(200).json({ success: true, data: students });
    } catch (err) {
      next(err);
    }
  }
};
