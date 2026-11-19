// Add a repository here, then render <ProjectRelease project={projects[id]} /> on its page.
// Default policy: newest published public release with uploaded downloadable assets.
export const projects = {
 magicnotice: {repo:'fage-go/magicnotice', policy:'magicnotice-signed', transfer:'magicnotice', title:'通知了 / MagicNotice', page:'https://hifage.com/projects/magicnotice/', qr:'assets/magicnotice-page-qr.png',
 name:'通知了', subtitle:'MagicNotice', platform:'ANDROID', icon:'assets/magicnotice-icon.png',
 purpose:'让通知各就各位，把注意力留给眼前的事。', purposeLines:['让通知各就各位，','把注意力留给眼前的事。'],
 description:'一个 Android 通知管理工具。用规则整理消息，换一种方式提醒，再按需要快捷回复。',
 downloadTitle:'带走通知了', format:'签名 APK',
 license:{label:'源码公开 · 非商业许可',summary:'使用前，先看许可。源码公开不等于可以自由商用，使用范围以项目许可与第三方声明为准。',name:'PolyForm Noncommercial 1.0.0',url:'https://github.com/fage-go/magicnotice/blob/main/LICENSE'},
 features:[
  {symbol:'☷',title:'让规则替你整理',description:'配置通知规则、调整命中优先级，让不同消息按你的习惯处理。'},
  {symbol:'▱',title:'提醒，也可以是一条弹幕',description:'配置屏幕弹幕的速度与效果。使用前需开启悬浮窗权限。'},
  {symbol:'↵',title:'少切换一步，快捷回复',description:'支持部分应用的通知快捷回复，具体以应用和系统支持情况为准。'}
 ]}
};
