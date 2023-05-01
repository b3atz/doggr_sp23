//Data base entry for messages
import {ManyToOne, PrimaryKey, Entity, Property, Unique, OneToMany, Collection, Cascade } from "@mikro-orm/core";


export class Message{
    @PrimaryKey()
        messageId!:number;

    @ManyToOne({primary: false})
        sender!:User;
    
    @ManyToOne({primary: false})
        reciver!:User;

    @Property()
        message!:string;
}