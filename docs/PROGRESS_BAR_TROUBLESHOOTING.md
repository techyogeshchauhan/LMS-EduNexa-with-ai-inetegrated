# Progress Bar Not Updating - Troubleshooting Guide

## Issue Fixed

The auto-formatter removed the `videoProgress` parameter from the `calculateDetailedProgress` function call in the useEffect, causing the progress calculation to not include video watch data.

## Fix Applied

### Before (Broken)
```typescript
const updatedProgress = calculateDetailedProgress(
  courseProgress,
  courseData.modules || [],
  courseData.assignments || []
  // Missing videoProgress parameter!
);
```

### After (Fixed)
```typescript
const updatedProgress = calculateDetailedProgress(
  courseProgress,
  courseData.modules || [],
  courseData.assignments || [],
  videoProgress  // ✅ Now includes video progress
);
```

## How to Verify the Fix

### 1. Open Browser Console
Open DevTools (F12) and go to the Console tab.

### 2. Load a Course
Navigate to a course detail page.

### 3. Check Console Output

You should see:
```
📊 Progress data from backend: { materials: {...}, assignments: {...}, ... }
📦 Course modules: [...]
📹 Video progress state: {}
✅ Calculated detailed progress: { overall: 0, materials: {...}, ... }
```

### 4. Perform Actions

**Mark a material complete:**
```
Updated progress: { overall: 10, materials: { completed: 1, total: 10, percentage: 10 }, ... }
Video progress: {}
Course progress will be: 10
```

**Watch a video:**
```
Updated progress: { overall: 15, videos: { completed: 1, total: 8, percentage: 13 }, ... }
Video progress: { "video_id_1": 485.5 }
Course progress will be: 15
```

### 5. Verify UI Updates

- ✅ Progress bar width should animate
- ✅ Percentage should update (e.g., 0% → 10% → 15%)
- ✅ Component counts should update
- ✅ Loading spinner should show during refresh

## Common Issues & Solutions

### Issue 1: Progress Still Shows 0%

**Possible Causes:**
1. No data in backend
2. Student not enrolled
3. Course has no materials

**Solution:**
```typescript
// Check console for:
console.log('📊 Progress data from backend:', progressData);

// If progressData is null or empty:
// - Verify student is enrolled in course
// - Check if course has materials/assignments
// - Verify backend API is working
```

### Issue 2: Progress Doesn't Update After Action

**Possible Causes:**
1. `refreshProgress()` not being called
2. API call failing
3. State not updating

**Solution:**
```typescript
// Check console for:
console.log('✅ Calculated detailed progress:', updatedProgress);

// If you don't see this log after an action:
// - Verify refreshProgress() is called in action handlers
// - Check Network tab for API calls
// - Look for errors in console
```

### Issue 3: Video Progress Not Counting

**Possible Causes:**
1. Video IDs don't match
2. `videoProgress` state not updating
3. Watch time not being saved

**Solution:**
```typescript
// Check console for:
console.log('📹 Video progress state:', videoProgress);

// Should show:
// { "video_id_1": 125.5, "video_id_2": 450.0 }

// If empty or wrong IDs:
// - Verify material.content matches video._id
// - Check VideoPlayer onProgressUpdate callback
// - Verify backend /api/progress/video/.../watch-time endpoint
```

### Issue 4: Progress Bar Doesn't Animate

**Possible Causes:**
1. CSS transition not working
2. Width not updating
3. React not re-rendering

**Solution:**
```typescript
// Check in React DevTools:
// - courseData.progress value
// - Should change when actions occur

// Verify CSS:
<div
  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
  style={{ width: `${course.progress}%` }}  // Should update
></div>
```

## Testing Checklist

### Initial Load
- [ ] Open course page
- [ ] Check console for progress logs
- [ ] Verify progress shows correct initial value
- [ ] Check if component counts are correct

### Mark Material Complete
- [ ] Click "Mark Complete" button
- [ ] Check console for "Updated progress" log
- [ ] Verify progress percentage increases
- [ ] Verify progress bar animates
- [ ] Verify material count increases

### Watch Video
- [ ] Open video p
 failing!p isch ste whitify idenole logs tok the conschect update, ll doesn'ss bar stiprogre the hly

Ifmoot work snimations ✅ A sync
5.ts update inmponenll UI coes
4. ✅ Aebug issuhelp d logs oleons✅ Cchanges
3. ndency depe when any latescalcuess re2. ✅ Progreter
gress` parames `videoProceiv reress`dProglateDetaile`calcu1. ✅ e:
becausctly update correuld now ess bar shogrhe pro
TSummary
`

## ``
}
ata);progressD data:', rogress Pg('📊nsole.lo
  coDEBUG) {';

if (ent= 'developm.NODE_ENV ==s.env= procesconst DEBUG ypescript
flag:
```tebug r use a d```

O;
overall)s.tedProgres', updass will be:progreourse log('Cle.so
conProgress);s:', videoesdeo progr'Vie.log(s);
consologres', updatedPrgress:'Updated prog(onsole.lo);
cgressedPropdats:', ugresailed proetlculated dle.log('✅ Caess);
consoeoProgrte:', vidtaress sog('📹 Video prconsole.logodules);
courseData.mmodules:', 📦 Course nsole.log(';
cossData):', progrendbackedata from s gres('📊 Pro
console.loglines:ese ve thpt
// Remotypescri:

```ebug logse dg, removployinore de

Befleanup Cductionro
## P
```
.progress]);rseou
}, [c now; =ntre.curtUpdate);
  last, 'ms'renUpdate.curow - last nafter',ss updated rogre('P.log
  consolee.now(); now = Dat
  const(() => {ctffe());
useEte.noweRef(Dadate = ustUp lasct:
consto useEffe
// Add t``typescriptuency
`Update Freq
### Check );
```

}imes');nt, 'turreCount.crendered:', renderComponent e.log('  consol+;
urrent+unt.cerCo
  rend => {useEffect(()f(0);
nt = useReourCrendeconst component:
to 
// Add criptesnt
```typender Couheck Re-r

### Cnitoringrformance Mo
## Pe``

`: 7ill beess wogrourse pr }
C5.5": 48ideo_id_1{ "v progress: 
}
Videoerageted avWeigh: 7  // verall,
  o0 }: , percentage 0, total: 3 completed:  quizzes: { 0 },
e:ercentagtal: 5, p0, to: { completedts:   assignmen13 },
age: ent, percotal: 8leted: 1, t compos: {0 },
  vidercentage: 1l: 10, pe1, totacompleted: terials: { 
  maprogress: {`
Updated 
``0%Video to 8 Watching # 3. After##3
```

ss will be: progrerse : {}
Cou progress
}
Videozed)ormali0 (n= 1.3) / 0.3  (10 * 0rall: 3  //
  ove: 0 },rcentagetotal: 3, pepleted: 0,  { comes: quizz
 age: 0 },nterce total: 5, p 0,d:completents: { signme,
  as0 }: ntagerce petotal: 8,eted: 0, ompldeos: { c10 },
  vitage: 10, percenal: : 1, tot{ completedmaterials: ss: {
  ted progre
Updaplete
```l Comriaaterking Mer Ma
### 2. Aft
```
 0
}
  overall:},ntage: 0 al: 3, perce, totcompleted: 0quizzes: { },
  0 e: ercentagal: 5, p totompleted: 0, cnments: {  assige: 0 },
centager 8, p: 0, total: { completed
  videos:entage: 0 },al: 10, perc, toted: 0 { completrials:: {
  mateprogressd taileated deul
✅ Calc: {}gress statedeo pro.]
📹 Vi }, ..falsecompleted: ", "video.", type:  id: "..dules: [{moourse 
📦 Cd: 0 }
}3, complete total: uizzes: { qted: 0 },
 : 5, submits: { totalntmessign [] },
  apleted_ids:ted: 0, com 10, complels: { total:eria {
  matom backend: frs data📊 Progres
```
adial Lo 1. Init Flow

###ole Output Cons## Expected``

reload();
`
location.r();age.cleanStor;
sessioclear()lStorage.ocaonsole:
lr c/ In browsevascript
/ting)
```ja(for teste set Sta`

### Re``tton>
ress
</buresh Prog Ref
  🔄ess()}>efreshProgr r=>={()  onClickbutton:
<rarilyn tempod a butto ad
// Oress();
freshProgrwindow.res):
hProgresresef ru expose(if yonsole rowser copt
// In bjavascriRefresh
```gress Pro# Force ``

##;
`ess)eoProgridess:', vdeoProgr virentle.log('Curss);
consoedProgre, detailess:'rogr detailedPent('Currconsole.loggress);
e.pro, coursess:'progrurse.rrent coCuog('nsole.ldd:
co aponent,age cometailPn CourseD

// Iogging: ltemporaryOr add  state
//  componentpectls and insooeact DevTess Rccript
// Aasc``javole)
`Consin Browser ate ( St Current### Checknds

 Debug Commaeases

##gress incrl proal over[ ] Verifyeases
- nt incrnt couassignme ] Verify update
- [ progress onsole foreck c ] Chment
- [it an assign ] Submt
- [nmenubmit Assigted

### Sar updaogress bify prere
- [ ] Vupdatress rogfor final pck console 
- [ ] Chee videoosCle)
- [ ] pletcomuld auto- 80%+ (shoWatch until
- [ ] ess updates video progror feck consoleds
- [ ] Chconh for 10+ se- [ ] Watclayer
