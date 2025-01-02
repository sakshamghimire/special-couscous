import { saveEmail } from "./entity";
import { buildFilterCriteria, getConn, getEmail } from "./imap_helpers";

const main = async () => {
    let connection
    
    try{
        
        let lastFetch = new Date()
        lastFetch.setDate(lastFetch.getDate() - 10)

        connection = await getConn({email:'', password:''})
    
        const emails = await getEmail(connection, buildFilterCriteria(lastFetch, []))
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