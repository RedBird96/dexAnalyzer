import {
  WebSite,
  FaceBook,
  Twitter,
  Github,
  Instagram,
  Medium,
  Telegram,
  Discord,
  Reddit
} from "../../assests/icon"
import { Box } from "@chakra-ui/react"
import { ERC20Token } from "../../utils/type"
import style from './TokenInfo.module.css'

export default function SocialListBox({
  token
}:{
  token: ERC20Token
}
) {

  return (
    <Box
      display={"flex"}
      flexDirection={"row"}
      alignItems={"center"}
    >
      {
        token.website != "" && token.website != undefined && 
        <a 
          className={style.socialUrl} 
          href={token.website} 
          style={{marginRight:"0.5rem"}} 
          target="_blank"
          rel="noreferrer noopener"
        >
          <WebSite className={style.socialUrl}/>
        </a>            
      }
      {
        token.facebook != "" && token.facebook != undefined &&  
        <a 
          className={style.socialUrl} 
          href={token.facebook} 
          style={{marginRight:"0.5rem"}} 
          target="_blank"
          rel="noreferrer noopener"
        >
          <FaceBook className={style.socialUrl}/>
        </a>
      }
      {
        token.twitter != "" && token.twitter != undefined && 
        <a 
          className={style.socialUrl} 
          href={token.twitter} 
          style={{marginRight:"0.5rem"}} 
          target="_blank"
          rel="noreferrer noopener"
        >
          <Twitter className={style.socialUrl}/>
        </a>
      }
      {
          token.medium != "" && token.medium != undefined && 
          <a 
          className={style.socialUrl} 
          href={token.medium} 
          style={{marginRight:"0.5rem"}} 
          target="_blank"
          rel="noreferrer noopener"
        >
          <Medium className={style.socialUrl}/>
        </a>                
      }
      {
          token.instagra != "" && token.instagra != undefined && 
          <a 
          className={style.socialUrl} 
          href={token.instagra} 
          style={{marginRight:"0.5rem"}} 
          target="_blank"
          rel="noreferrer noopener"
        >
          <Instagram className={style.socialUrl}/>
        </a>                
      }          
      {
          token.telegram != "" && token.telegram != undefined && 
          <a 
          className={style.socialUrl} 
          href={token.telegram} 
          style={{marginRight:"0.5rem"}} 
          target="_blank"
          rel="noreferrer noopener"
        >
          <Telegram className={style.socialUrl}/>
        </a>                
      }                   
      {
          token.discord != "" && token.discord != undefined && 
          <a 
          className={style.socialUrl} 
          href={token.discord} 
          style={{marginRight:"0.5rem"}} 
          target="_blank"
          rel="noreferrer noopener"
        >
          <Discord className={style.socialUrl}/>
        </a>                
      }          
      {
          token.reddit != "" && token.reddit != undefined && 
          <a 
          className={style.socialUrl} 
          href={token.reddit} 
          style={{marginRight:"0.5rem"}} 
          target="_blank"
          rel="noreferrer noopener"
        >
          <Reddit className={style.socialUrl}/>
        </a>                
      }               
      {
          token.github != "" && token.github != undefined &&
          <a 
          className={style.socialUrl} 
          href={token.github} 
          style={{marginRight:"0.7rem"}} 
          target="_blank"
          rel="noreferrer noopener"
        >
          <Github className={style.socialUrl}/>
        </a>                
      }                      
    </Box>
  )
}