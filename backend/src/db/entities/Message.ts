//Data base entry for messages
import { ManyToOne, PrimaryKey, Entity, Property, Unique, OneToMany, Collection, Cascade } from "@mikro-orm/core";
import type { Rel } from "@mikro-orm/core";
import { User } from "./User.js";

@Entity()
export class Message{
    @PrimaryKey()
        messageId!:number;

    @ManyToOne({primary: false})
        sender!:Rel<User>;
    
    @ManyToOne({primary:false})
        receiver!:Rel<User>;

    @Property()
        message!:string;
}