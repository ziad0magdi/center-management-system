import { GroupModel } from '../models/group.model.js';
import { TeacherModel } from '../models/teacher.model.js';

export const GroupService = {
  async getAllGroups(filter) {
    return GroupModel.findAll(filter);
  },

  async getGroupById(id) {
    const group = await GroupModel.findById(id);
    if (!group) {
      throw new Error(`Group with ID ${id} not found.`);
    }
    return group;
  },

  async createGroup(data) {
    const { teacher_id, group_name, monthly_fee, is_active } = data;
    if (!teacher_id || !group_name || monthly_fee === undefined) {
      throw new Error('Teacher, Group Name, and Monthly Fee are required.');
    }

    const teacher = await TeacherModel.findById(teacher_id);
    if (!teacher) {
      throw new Error(`Assigned teacher with ID ${teacher_id} does not exist.`);
    }

    return GroupModel.create({
      teacher_id,
      group_name,
      monthly_fee: parseFloat(monthly_fee),
      is_active: is_active !== undefined ? is_active : true
    });
  },

  async updateGroup(id, data) {
    const { teacher_id, group_name, monthly_fee, is_active } = data;
    if (!teacher_id || !group_name || monthly_fee === undefined) {
      throw new Error('Teacher, Group Name, and Monthly Fee are required.');
    }

    const updated = await GroupModel.update(id, {
      teacher_id,
      group_name,
      monthly_fee: parseFloat(monthly_fee),
      is_active: is_active !== undefined ? is_active : true
    });

    if (!updated) {
      throw new Error(`Group with ID ${id} could not be updated.`);
    }
    return updated;
  },

  async deleteGroup(id) {
    const success = await GroupModel.delete(id);
    if (!success) {
      throw new Error(`Group with ID ${id} not found.`);
    }
    return { message: 'Group deleted successfully.' };
  },

  async getGroupStudents(groupId) {
    return GroupModel.getGroupStudents(groupId);
  }
};
