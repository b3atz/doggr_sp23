import exp from 'constants';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
//const fastify = require('fastify')({logger: true});
import * as fs from "fs";
const badWordPath = path.join(__dirname, "badwords.txt");
const data = fs.readFileSync(badWordPath).toString();
export default function Filter(msg: string) {
   const words:string[] = data.split(/\r|\n|\*|\(/g);
   for (var i = 0; i < words.length; i += 1) {
    if(msg.search(words[i]) != -1)
        if(words[i] !+ ''){
            return true;
        }
   }
   return false;
}
