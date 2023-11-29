type MailInfo = {
    to: string[],
    cc: string[],
    subject: string
}
type Attachement = {
    id: string,
    name: string
}

export { MailInfo, Attachement }