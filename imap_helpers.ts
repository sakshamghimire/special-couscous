import * as imaps from 'imap-simple'
import { AddressObject, simpleParser } from 'mailparser';
import { EmailRecord } from './entity';
import { uploadFile } from './file_storage';
import { ensureArray, getAddressTexts } from './utils';


interface User {
    email: string
    password: string
}

export async function getConn(user: User) {

    const config: imaps.ImapSimpleOptions = {
        imap: {
            user: user.email,
            password: user.password,
            host: 'imap.gmail.com',
            port: 993,
            tls: true,
            tlsOptions: { rejectUnauthorized: true, servername: 'imap.gmail.com' },
            authTimeout: 30000
        }
    };

    return await imaps.connect(config)
}


export function buildFilterCriteria(lastFetch: Date, contacts: Array<string>): Array<Array<string | string[]>> {

    const formattedDate = lastFetch.toISOString().slice(0, 10);
    const dateCriteria: Array<string> = ['SINCE', formattedDate];
    const contactsCriteria: Array<string | Array<string>> = ['OR']
    contacts.forEach(contact => {
        contactsCriteria.push(['FROM', contact]);
        contactsCriteria.push(['TO', contact]);
    });
    return [dateCriteria, contactsCriteria];
}


export async function getEmail(connection: imaps.ImapSimple, filter_: Array<Array<string | string[]>>, folder: string = "[Gmail]/All Mail") {

    try {
        
        await connection.openBox(folder)

        const fetchOptions = {
            bodies: [''], // ? specifies what part of body to get, '' specifies whole body, can use ['HEADER', 'TEXT'] optionally
            markSeen: false,
            struct: true
        };

        const results = await connection.search(filter_, fetchOptions);

        const emailObjectsToSave: EmailRecord[] = []

        for (const email of results) {
            console.log(email)
            const emailBody = email.parts.find((part) => part.which === '')?.body || '';
            const parsed = await simpleParser(emailBody)

            const attachmentsUrl: string[] = []

            if (parsed.attachments.length > 0) {
                console.log(`Found ${parsed.attachments.length} attachment(s) on email ${parsed.headers.get('message-id')}`);
                for (const attachment of parsed.attachments) {
                    if (!attachment.related) {
                        let url = await uploadFile(attachment.content)
                        attachmentsUrl.push(url)
                    }
                }
            }

            const message_id = parsed.headers.get('message-id') as string
            console.log(parsed.text)
            emailObjectsToSave.push({
                message_id: message_id,
                content: parsed.html || parsed.textAsHtml || '',
                subject: parsed.subject ?? '',
                from: getAddressTexts(parsed.from)[0],
                communicated_at: parsed.date,
                to: getAddressTexts(parsed.to),
                in_reply_to: parsed.headers.get('in-reply-to')?.toString() ?? null,
                bcc: getAddressTexts(parsed.bcc),
                cc: getAddressTexts(parsed.cc),
                references: parsed.references ? ensureArray(parsed.references) : [],
                attachmentsUrl: attachmentsUrl
            });
        }
        return emailObjectsToSave
    } catch (error) {
        console.error('Error fetching emails:', error);
    } finally {
        if (connection) {
            connection.end();
            console.log("Successfully closed imap connection")
        }
    }
    return []

}