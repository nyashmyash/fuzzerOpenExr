function R( x ){
		return Math.floor( Math.random() * x );
	}

function Rint()
{
	if (RBool())
		return 0xFFFFFFFF;
	else
		return R(0xFFFFFFFF)
}	
	function RBool(){
		r=R(2);
		if (r==0) {return true;}
		else {return false;}
	}
	 
obj_list_header = [ 
	 ['channels', 'chlist']
	,['compression', 'compression']
	,['dataWindow', 'box2i']
	,['lineOrder' , 'lineOrder']
	,['screenWindowCenter','v2f']
	,['screenWindowWidth','float']
	,['pixelAspectRatio','float']
	,['displayWindow','box2i']
	,['name','string']
	,['type','string']
	,['chunkCount', 'int']
	//,['view', 'text']
	,['version', 'int']
	,['tiles', 'tiledesc']
	,['preview','preview']
	,['maxSamplesPerPixel', 'int']
];

obj_list_types = 
[
	['tiledesc',2*4]//2 uints
	,['compression', 1] //uchar (0-7)
	,['chlist', -2] //name 00 int(0-2)uchar 00 00 00 int int ---
	,['lineOrder', 1] //uchar(0-2)	
	,['box2i',4*4] //4 ints
	,['box2f',4*4]//4 floats
	,['v2f',2*4] //2 floats
	,['v2i',2*4] //2 ints
	,['v3f',3*4] //3 floats
	,['v3i',3*4] //3 ints
	,['m33f',9*4] //9 floats
	,['m44f',16*4] //16 floats
	,['string', -1] //int chars	----
	,['rational', 2*4]// int uint
	,['int', 4]
	,['float', 4]
	,['double',2*4]
	,['chromaticities',8*4] //8 floats
	,['envmap',  1]//uchar (0-1)
	,['keycode',7*4] //7 ints
	,['stringvector', -3] //int chars ----
	,['preview', -4] //2 uint 4*x*h uchars ----
	,['timecode', 2*4] //2 uints
];
function getTypeIndxToHdr(hdr)
{
	i = 0;
	while(i<obj_list_types.length)
	{
		if (obj_list_header[hdr][1] == obj_list_types[i][0])
			return i;
		i++;
	}
	return -1;
}	
function getTypeSize(str)
{
	i = 0;
	while(i<obj_list_types.length)
	{
		if (obj_list_types[i][0] == str)
			return i;
		i++;
	}
	return -1;
}	
function genInt(i)
{
	var k = 0;
	var s ='';
	while (k<4)
	{
		s+=String.fromCharCode(i%0xFF);
		i = Math.round(i/0xFF);
		k++;
	}
	return s;	
}

function generRandomChlist()
{
	var sout = '';
	var soutt = '';
	var size = 0;
	cnt = R(0xF);
	cntch = 0;
	i = 0;
	while (i < cnt)
	{
		cntch = R(0xF);
		soutt += randomElem1(cntch) + Null(1) + R(3) + genInt(R(0xFF)) + Null(3) + randomElem1(4)  + randomElem1(4);//17+cntch
		size +=17+cntch;
		i++;
	}
	
	sout = genInt(size) + soutt;
	return sout;
}
function generVectStr()
{
	cnt = R(0xFF);
	allcnt = 0;
	while (cnt>0)
	{
		size = R(0xFF);
		if (RBool())
			size +=0xFFFF;
		soutt = genInt(size) + randomElem1(size);
		allcnt += size + 4;
		cnt--;
	}
	sout = genInt(allcnt) + soutt;
	return sout;
}
function generPeview()
{
	h = R(0xFF);
	w = R(0xFF);
	
	sout = genInt(8 + 4*h*w) + genInt(h) + genInt(w) + randomElem1(4*h*w);
}
/*function getTypeSize(it)
{
	if (it == 'compression'||it == 'lineOrder'||it == 'envmap')
		return 1;
	if (it == 'int' || it == 'float')
		return 4;
	if (it == 'tiledesc' || it == 'timecode' || it == 'v2f' || it == 'v2i' || it == 'double' || it == 'rational')
		return 4*2;
	if (it == 'v3f' || it == 'v3i')
		return 4*3;
	if (it == 'box2i' || it == 'box2f')
		return 4*4;
	if (it == 'keycode')
		return 4*7;
	if (it == 'chromaticities')
		return 4*8;
	if (it == 'm33f')
		return 4*9;
	if (it == 'm44f')
		return 4*16;
	if (it == 'string')
		return -1;
	if	(it == 'chlist')
		return -2;
	if(it == 'stringvector')
		return -3;
	if(it == 'preview')
		return -4;	
}*/


function findHeader(s, hdri)
{
	indx = 0;
	sh = obj_list_header[hdri][0];
	while(indx<s.length)
	{
		j = 0;
		while (j < sh.length)
		{
			if(sh.charAt(j) != s.charAt(indx+j))
				break;			
			j++;
		}
		if (j ==  sh.length && (s.charAt(indx + sh.length)==String.fromCharCode(0)))
		{
			return indx;
		}
		indx ++;
	}
	return -1;
}
function sleep(ms) {
ms += new Date().getTime();
while (new Date() < ms){}
} 
function findRndHeader(s, obj)
{
	indx = 0;
	hindx = 0;
	find = true;
	while(find)
	{
		hindx = R(obj_list_header.length);
		indx = findHeader(s, hindx);
		if (indx < 0)
			find = true;
		else
			find = false;
	}
	obj.indx = indx;
	obj.hindx = hindx;
}
function Null(i)
{
	sout ='';
	while(i>0)
	{
		sout = sout + String.fromCharCode(0) 
		i--;
	}
	return sout;
}

function insertInPosRndElem(s)
{
	var o = {indx : 0, hindx : 0};
	findRndHeader(s,o);
	pos = o.indx;
	ih = R(obj_list_header.length);
	if (RBool())
		it = R(obj_list_types.length);
	else
		it = getTypeIndxToHdr(ih);
		
	size = obj_list_types[it][1];
	var chsize;
	var relem;
	if (RBool())
	{
		size = R(0xFF);
		if (RBool())
			size +=0xFFFF;
		relem = genInt(size) + randomElem1(size);
	}
	else
		if (size>0)
		{
			relem = genInt(size) + randomElem1(size);
		}
		else 
			if (size == -1)
			{
				size = R(0xFF);
				if (RBool())
					size +=0xFFFF;
				relem = genInt(size) + Null(3) +randomElem1(size);
			}
			else
				if (size == -2)
				{
					relem = generRandomChlist();
				}
				else 
					if (size == -3)
					{
						relem = generVectStr();
					}
					else
						if(size == -4)
						{
							relem = generPeview();
						}
						
	var sout = s.substr(0,pos);
    var str2 = s.substr(pos);

	
	sout += obj_list_header[ih][0] + Null(1) + obj_list_types[it][0] +  Null(1) + relem;
	
	sout += str2;
	return sout; 
}
function mutateRndTypeVal(s)
{
	var o = {indx : 0, hindx : 0};
	findRndHeader(s, o);
	indx = o.indx + obj_list_header[o.hindx][0].length + 1
	while (s.charAt(indx)!=String.fromCharCode(0))
	{
		indx ++;
	}
	indx++;
	cnt = 0;
	i = 0;
	
	while (i<4)
	{
		cnt = cnt + s.charCodeAt(indx)*Math.pow(0xFF,i);
		indx++;
		i++;
	}
	i = 0;
	srand = randomElem(cnt, s, indx);
	var sout = s.substr(0,indx);
    var str2 = s.substr(indx+cnt);
	return sout + srand + str2;
}
function mutateReplaceAttr(s, rall)
{
	var o = {indx : 0, hindx : 0};
	findRndHeader(s, o);
	var srepl = obj_list_header[o.hindx][0];
	
	if (RBool())
		rand = obj_list_header[R(obj_list_header.length)][0];
	else
		rand = randomElem1(srepl.length);
		
	if (rall)
	{
		var re = new RegExp(srepl, 'g');
		return s.replace(re, rand);
	}
		
	return s.replace(srepl,rand);
}
function mutateReplaceType(s, rall)
{
	var o = {indx : 0, hindx : 0};
	findRndHeader(s, o);
	var srepl = obj_list_header[o.hindx][1];
	
	if (RBool())
		rand = obj_list_types[R(obj_list_types.length)][0];
	else
		rand = randomElem1(srepl.length);
	
	if (rall)
	{
		var re = new RegExp(srepl, 'g');
		return s.replace(re, rand);
	}
		
	return s.replace(srepl,rand);
}
function insertInPos(s, str, pos)
{
	var sout = s.substr(0, pos) + str + s.substr(pos);
	return sout;
}
function mutateRndByte(s)
{
	var sout = '';
	
	for(i = 0;i<s.length;i++)
	{
		
		if (R(100)<90 || ('a' <= s.charAt(i) && 'z' >= s.charAt(i) )|| ('A' <= s.charAt(i) && 'Z' >= s.charAt(i) ))
			sout += s.charAt(i);
		else
			sout += String.fromCharCode(R(0xFF));
	}
	return sout;
}
function randomElem1(count)
{
	var sout ='';
	for(i = 0;i<count;i++)
	{
		if (RBool())
			a = String.fromCharCode(R(0xFF));
		else 
			a = String.fromCharCode(0xFF);
		sout = sout + a;
	}
	return sout;
}
function randomElem(count, str, pos)
{
	var sout ='';
	for(i = 0;i<count;i++)
	{
		if (RBool())
			a = String.fromCharCode(R(0xFF));
		else
			a = str[pos + i];
		sout = sout + a;
	}
	return sout;
}
function rndMut(data)
{
	var r = R(5);
	if (r == 0)
		return insertInPosRndElem(data);
	else
		if (r == 1)
			return mutateReplaceAttr(data, RBool());
		else
			if (r == 2)
				return mutateReplaceType(data, RBool());
			else
				if (r == 3)
					return mutateRndTypeVal(data);	
				else
					if (r == 4)
						return mutateRndByte(data);						
									
}

function mutatefile()
{
	fs = require('fs')
	fs.readFile('D:\\AllHalfValues.exr', 'binary', function (err,data) {
	  if (err) {
		return console.log(err);
	  }
	  // s = mutateRndTypeVal(data);
	  s = rndMut(data);
	 // s = mutateReplaceAttr(data, true);
	  fsnew = require('fs');
	  fsnew.writeFile('D:\\AllHalfValues_new.exr', s, 'binary', function (err) {
	  if (err) return console.log(err);
	  console.log('file was written');
	  });
	});
}
mutatefile();
//setTimeout(process.exit, 10000);