// WhatsApp Notification Service (Mock integration layer for automated parent alerts)

const messageLog = [];

export const WhatsAppService = {
  async sendAbsenceNotification({ student, session, teacherName = 'Teacher', customMessage = '' }) {
    const parentPhone = student.parent_phone;
    const studentName = student.full_Name;
    const sessionDate = session.session_date;
    const groupName = session.group_name;

    const defaultText = `⚠️ [Smart Educational Center - Attendance Notice]\nDear Parent, we would like to inform you that your child (${studentName}) was ABSENT from today's session in [${groupName}] on ${sessionDate}.\nTeacher: ${teacherName}.\nPlease contact the center administration if you have any questions.`;

    const finalMessage = customMessage || defaultText;

    // Simulate WhatsApp Cloud API / Twilio WhatsApp dispatch
    const notificationRecord = {
      message_id: `WA-MSG-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      student_id: student.student_ID,
      student_name: studentName,
      recipient_phone: parentPhone,
      session_id: session.session_ID,
      session_title: session.session_title,
      group_name: groupName,
      message_body: finalMessage,
      status: 'DELIVERED',
      sent_at: new Date().toISOString()
    };

    messageLog.unshift(notificationRecord);
    console.log(`📱 [WhatsApp Mock Sent] To: ${parentPhone} | Student: ${studentName} | Status: DELIVERED`);

    return notificationRecord;
  },

  async sendBulkAbsenceNotifications({ absentStudents, session, teacherName, customMessage }) {
    const results = [];
    for (const student of absentStudents) {
      const result = await this.sendAbsenceNotification({
        student,
        session,
        teacherName,
        customMessage
      });
      results.push(result);
    }
    return {
      total_sent: results.length,
      notifications: results
    };
  },

  getMessageHistory(sessionId = null) {
    if (sessionId) {
      return messageLog.filter(m => m.session_id === Number(sessionId));
    }
    return messageLog;
  }
};
