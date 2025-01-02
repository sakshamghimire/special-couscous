import { Client } from 'pg';
import { withConnection, withTransaction } from './db_conn';
import { QUERIES } from './queries';


export interface EmailRecord {
  message_id: string,
  content: string,
  subject: string,
  from: string,
  communicated_at: Date | undefined,
  to: string[],
  in_reply_to: string | null,
  bcc: string[],
  cc: string[],
  references: string[],
  attachmentsUrl: string[]
}

export interface AttachmentRecord {
  url: string
}

export interface EmailAttachmentRecord {
  email_id: string
  attachment_id: string
}

export interface Attachment extends AttachmentRecord {
  id: string
}

type Email = Omit<EmailRecord, 'attachmentsUrl'> & {
  id: string
};


export async function saveEmail(emails: EmailRecord[]) {


  return await withConnection(async (connectedClient) => {

    const results = [];

    for (const email of emails) {
      try {
        const result = await withTransaction(connectedClient, async (txClient) => {
          const emailResult = await txClient.query<Email>(QUERIES.saveEmail,
            [
              email.message_id,
              email.content,
              email.subject,
              email.from,
              email.to,
              email.communicated_at,
              email.in_reply_to,
              email.bcc,
              email.cc,
              email.references
            ]
          );
          if (email.attachmentsUrl?.length) {
            const attachmentResult = await txClient.query<Attachment>(QUERIES.saveAttachments, [email.attachmentsUrl]);
            if (attachmentResult.rows.length) {
              const attachmentIds = attachmentResult.rows.map(row => row.id);
              console.log("here")
              await txClient.query<EmailAttachmentRecord>(QUERIES.saveEmailAttachments, [emailResult.rows[0].id, attachmentIds]);
              console.log('executed')
            }
          }
          return emailResult.rows[0];
        });

        results.push(result);
      } catch (error) {
        console.error(`Failed to save email ${email.message_id}:`, error);
      }
    }
    return results;
  });
}

