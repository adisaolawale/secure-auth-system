import { randomInt } from "node:crypto"

export const getToken = () => {
    let verificationToken = ''
    for (let index = 0; index < 6; index++) {
        const element = randomInt(9)
        const stringElement = `${element}`
        verificationToken += stringElement
    }

    return verificationToken
}