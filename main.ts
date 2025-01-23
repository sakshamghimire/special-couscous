import { saveEmail } from "./entity";
import { buildFilterCriteria, getConn, getEmail } from "./imap_helpers";

const main = async () => {
    let connection
    
    try{
        
        let lastFetch = new Date()
        lastFetch.setDate(lastFetch.getDate() - 10)

        connection = await getConn({email:'sakshamghimire@lftechnology.com', password:'xplp evkk fgeb ihxg'})
    
        const emails = await getEmail(connection, buildFilterCriteria(lastFetch, ['alinadangol@lftechnology.com']))
        console.log(emails)
        await saveEmail(emails)

    } catch (error){

    } finally {
        if (connection){
            connection.end()
        }
    }
}

main()