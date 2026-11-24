// Add a repository here, then render <ProjectRelease project={projects[id]} /> on its page.
// Default policy: newest published public release with uploaded downloadable assets.
export const projects = {
 magicnotice: {repo:'fage-go/magicnotice', policy:'magicnotice-signed', transfer:'magicnotice', title:'通知了 / MagicNotice', page:'https://hifage.com/projects/magicnotice/', qr:'assets/magicnotice-page-qr.png',
 name:'通知了', subtitle:'MagicNotice', platform:'Android', icon:'assets/magicnotice-icon.png',
 purpose:'让通知各就各位，把注意力留给眼前的事。', purposeLines:['让通知各就各位，','把注意力留给眼前的事。'],
 description:'一个 Android 通知管理工具。用规则整理消息，换一种方式提醒，再按需要快捷回复。',
 downloadTitle:'下载',
 license:{shortLabel:'非商业许可',name:'PolyForm Noncommercial 1.0.0',url:'https://github.com/fage-go/magicnotice/blob/main/LICENSE'},
 features:[
  {symbol:'☷',title:'通知规则',description:'按条件整理通知，自定义规则的匹配优先级。'},
  {symbol:'▱',title:'弹幕提醒',description:'自定义弹幕速度和样式，使用时需要悬浮窗权限。'},
  {symbol:'↵',title:'快捷回复',description:'直接从通知回复，支持范围视应用和系统而定。'}
 ]}
};
