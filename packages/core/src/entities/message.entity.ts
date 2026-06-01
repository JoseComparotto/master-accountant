export class Message {

    content!: string;

    constructor(content: string) {
        this.content = content;
    }

    static hello(): Message {
        return new Message('Hello Monorepo!');
    }

}