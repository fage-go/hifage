// Pure geometry; all coordinates are viewport-relative. No runtime dependency.
export function placePopover(anchor,viewport,width,height){
 const pad=12,gap=10,w=Math.min(width,viewport.width-pad*2),h=Math.min(height,viewport.height-pad*2);
 const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
 const cx=(anchor.left+anchor.right)/2,cy=(anchor.top+anchor.bottom)/2;
 const positions={right:{x:anchor.right+gap,y:cy-h/2},left:{x:anchor.left-gap-w,y:cy-h/2},bottom:{x:cx-w/2,y:anchor.bottom+gap},top:{x:cx-w/2,y:anchor.top-gap-h}};
 for(const side of ['right','left'])positions[side].y=clamp(positions[side].y,pad,viewport.height-h-pad);
 for(const side of ['bottom','top'])positions[side].x=clamp(positions[side].x,pad,viewport.width-w-pad);
 const order=viewport.width<=700?['bottom','top','right','left']:['right','left','bottom','top'];
 const overflow=({x,y})=>Math.max(0,pad-x)+Math.max(0,x+w+pad-viewport.width)+Math.max(0,pad-y)+Math.max(0,y+h+pad-viewport.height);
 let side=order[0];for(const candidate of order){if(overflow(positions[candidate])<overflow(positions[side]))side=candidate;if(overflow(positions[side])===0)break;}
 const x=clamp(positions[side].x,pad,viewport.width-w-pad),y=clamp(positions[side].y,pad,viewport.height-h-pad);
 const arrow=(side==='left'||side==='right')?clamp(cy-y,16,h-16):clamp(cx-x,16,w-16);
 return {x,y,width:w,height:h,side,arrow};
}
