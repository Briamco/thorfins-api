import { Router } from "express";
import { authRouter } from "./auth";
import { readdirSync } from "fs";

const PATH_ROUTER = `${__dirname}`
const router = Router()

const cleanFileName = (fileName: string) => {
  const file = fileName.split('.').shift()
  return file
}

readdirSync(PATH_ROUTER).filter((fileName) => {
  const cleanName = cleanFileName(fileName)
  if (cleanName !== 'index' && cleanName !== 'auth') {
    import(`./${cleanName}`).then((moduleRouter) => {
      console.log(cleanName)
      router.use(`/${cleanName}`, moduleRouter.router)
    })
  }
})

export { router, authRouter }