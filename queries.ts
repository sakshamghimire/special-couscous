
export const QUERIES = {
    saveAttachments: `
    WITH existing AS (
      SELECT id, key FROM attachments WHERE key = ANY($1::text[])
    ),
    inserted AS (
        INSERT INTO attachments (key)
        SELECT unnest($1::text[])
        ON CONFLICT (key) DO NOTHING
        RETURNING id, key
    )
    SELECT id FROM existing
    UNION ALL
    SELECT id FROM inserted;`,

    saveEmail: `
      INSERT INTO emails (
        message_id, content, subject, "from", "to", communicated_at,
        in_reply_to, bcc, cc, reference
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (message_id) DO UPDATE SET
        content = EXCLUDED.content,
        subject = EXCLUDED.subject,
        "from" = EXCLUDED."from",
        "to" = EXCLUDED."to",
        in_reply_to = EXCLUDED.in_reply_to,
        bcc = EXCLUDED.bcc,
        communicated_at = EXCLUDED.communicated_at,
        cc = EXCLUDED.cc,
        reference = EXCLUDED.reference,
        updated_at = now()
      RETURNING id`,

    saveEmailAttachments: `INSERT INTO email_attachments (email_id, attachment_id) 
           SELECT $1, unnest($2::uuid[]) ON CONFLICT(email_id, attachment_id) DO NOTHING
           RETURNING email_id, attachment_id`

};