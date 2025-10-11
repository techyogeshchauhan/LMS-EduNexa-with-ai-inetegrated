import React, { useState, useEffect } from 'react';
import { getAuthToken } from '../../utils/tokenHelper';
import { 
  FileText, 
  Users, 
  CheckCircle, 
  Clock, 
  Award,
  Eye,
  Edit,
  Calendar,
  AlertCircle,
  Download,
  TrendingUp,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { Toast } from '../common/Toast';

interface Submission {
  _id: string;
  student_id: string;
  student_name: string;
  student_email: string;
  roll_no: string;
  text_content: string;
  file_name: string;
  file_path: string;
  submitted_at: string;
  status: string;
  grade?: number;
  feedback?: string;
  graded_at?: string;
}

interface Assignment {
  _id: string;
  title: string;
  description: string;
  course_id: string;
  course_title: string;
  due_date: string;
  max_points: number;
  submission_count: number;
  submissions?: Submission[];
}

export const TeacherDashboard: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [gradingModal, setGradingModal] = useState<{ show: boolean, submission: Submission | null }>({ 
    show: false, 
    submission: null 
  });
  const [grade, setGrade] = useState('');
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'graded'>('all');

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:5000/api/assignments/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAssignments(data.assignments);
      } else {
        setToast({ type: 'error', message: 'Failed to load assignments' });
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
      setToast({ type: 'error', message: 'Failed to load assignments' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchAssignmentDetails = async (assignmentId: string) => {
    try {
      const token = getAuthToken();
 
};
  );   </div>
       )}>
      /l)}
  ulst(n => setToa={()nClose  o       age}
 st.messtoassage={  me     type}
   toast.    type={
       <Toast (
       &&t toas>

      {/div    <  )}
      )
       )     /div>
   <       
      </div>        ton>
   </but               
ssionsw Submi        Vie
          w-4" />sName="h-4 Eye clas     <            >
                
 -2 ml-4"-center gap itemscolors flexon-ransiti700 tg-blue-:bverunded-lg hopy-2 roe px-4 whitt-0 tex-blue-60ame="bgclassN         
         id)}ignment._tDetails(assmenfetchAssignlick={() => onC          n
        to       <but   
      /div>
        <
        /div>          <
              </div>               </span>
                    
 s' : ''}nt !== 1 ? 'bmission_cout.suignmenssion{assnt} submicouion_ment.submissgn {assi                     e-600">
  text-blut-medium ame="fonclassN <span                  " />
    4 w-4"h-e= classNam    <Users          ">
        r gap-1enteems-ce="flex itNamv class  <di           
       iv>        </d            >
/spanoints<ts} pmax_poinment.ignn>{ass      <spa         />
       4 w-4" assName="h- clrdwa        <A              r gap-1">
teex items-cename="fliv classN          <d              </div>
             /span>
   ue_date)}<ignment.datDate(assorm{f<span>Due:                      />
 -4" "h-4 wme=lassNa<Calendar c                    ap-1">
  s-center gteme="flex iamsNiv clas          <d   
       gray-500"> text--smr gap-4 textcenteflex items-className="      <div                  
      /p>
       e}<tlt.course_tinmenassigurse: {mb-3">Co0 e-60-blum textt-s"texame=classN         <p 
         /p>escription}<nt.dssignme{a00 mb-3">"text-gray-6 className=       <p      h3>
     nt.title}</me-2">{assign00 mby-9ld text-gra"font-semibolassName=3 c <h               x-1">
  "fleassName=   <div cl          
   >fy-between"tart justi items-sme="flexiv classNa      <d   
     dow">sition-shamd traner:shadow-ovay-200 p-6 h-gr border bordernded-lg-white rou="bgclassNameid} ._ntsignme<div key={as        
    t) => (enmap((assignmnments.    assig       (

        ) :  </div>       age</p>
 courses ps from the signment>Create as-2" mt-500rayt-sm text-gme="tex classNa   <p    /p>
     found<ents gnmo assiay-600">Nxt-grassName="te     <p cl    -4" />
   uto mb400 mx-atext-gray-w-12 ="h-12 t className <FileTex         
  nter">-12 text-ceed-lg p50 rounday-bg-grssName="<div cla          ? (
  0===nts.length signme        {as>
4"space-y-Name="v classdi <

     </div>v>
          </dip>
    g}</gGradindins.pen{overallStatold">ont-b"text-3xl fclassName=     <p div>
          </n>
     Grading</spang di>Penity-90"-medium opacnt"text-sm foName=ssspan cla           < w-6" />
 ="h-6k className      <Cloc
      ">r gap-3 mb-2entems-cflex itelassName=" <div c
         white"> p-6 text-ed-lgoundllow-600 r-ye0 to50m-yellow-br froo--gradient-t="bg className   <div
             </div>
p>
        s}</missions.totalSubverallStatold">{ont-bfoext-3xl me="t  <p classNa        </div>
        s</span>
   Submissional">Totty-90 opacit-medium fon"text-smssName=<span cla          />
  6 w-6" ame="h- classN    <Users    
    mb-2">-3 ter gapms-cenx ite"fleclassName=     <div >
     ite"t-wh p-6 texrounded-lgo-green-600 00 tfrom-green-5-to-br bg-gradientame="ssN <div cla           
  >
        </div
  s}</p>ignmentlAssts.tota>{overallStat-bold"xl fonxt-3="temeclassNa       <p v>
     </di
        span>s</ntignmeTotal Assty-90">m opaci-medium font"text-sme=span classNa   <        " />
 h-6 w-6="Name classText     <File">
       3 mb-2center gap-ems-"flex itssName=<div cla
          white">t- texed-lg p-6und-600 ro500 to-blue from-blue--to-brient-gradssName="bgcla    <div   b-6">
  -3 gap-6 md-cols md:grigrid-cols-1e="grid lassNam     <div c */}
 ll Stats {/* Overa
     v>
di
      </   </button>
     sh    Refre     >
 ' : ''}`} /-spin? 'animatehing resw-4 ${refe={`h-4 amhCw classN <Refres         
        >
n-colors"ansitioded-lg tr rounblue-50ver:bg-00 hoxt-blue-6x-4 py-2 tegap-2 pnter s-celex itemlassName="f        ching}
  {refresd=sable          dih}
efresandleR{h    onClick=      <button
         
       /div>
       <ns</p>
 issiot submen studd gradeeview angray-600">RName="text-class       <p </h1>
   anagementt Mignmen>Ass00 mb-2"y-9ld text-gra font-botext-2xlName="<h1 class      div>
           <
 en mb-6">ify-betweenter justems-c"flex itame=ssNiv cla">
      <dsName="p-6  <div clas  (
  return tats();

llS getOverats =t overallStaons
  cist viewnments ligss // Main a
   );
  }
 </div>
     
         )}
         />null)}
  st(oa{() => setT   onClose=         age}
t.messge={toas messa          type}
 e={toast.    typ
            <Toast
      {toast && (

          )}
            </div>v>
            </di</div>
               on>
   utt   </b               )}
          
               </>
           '} Grade : 'Submite Grade'pdat'Ued' ? adatus === 'grbmission.stl.suodangMadi       {gr           
    4" />"h-4 w-lassName=rd cwa<A                  <>
                    
    ) : (                   </>
                  
 ubmitting...  S               div>
     nt"></reanspatre border-t-er-whit-2 bord4 border-4 w--full hin roundedate-spName="animlass<div c                             <>
            tting ? (
 bmi    {su           >
               
    gap-2"ms-center ex iteed flllowrsor-not-ad:cu50 disableity-opacisabled:-colors don00 transiti:bg-blue-7hoverg te rounded-l text-whilue-600y-2 bg-b="px-6 passName   cl              e))}
 Float(gradisNaN(parse!grade || ting || {submit disabled=         
        }ubmissioneGradeSck={handl onCli         
            <button  
          /button>           <
     ncel   Ca         
         >     }
        ={submitting    disabled              n-colors"
sitio00 tranr:bg-gray-2lg hove rounded-y-1000 bg-gragray-70py-2 text-Name="px-4   class                    }}
       );
       tFeedback(''      se             ;
 ')  setGrade('           });
       ssion: null bmie, suhow: falsgModal({ s setGradin                  {
  ick={() =>        onCl        button
        <          ">
nd gap-3ex justify-e flray-200 border-gder-t bor"p-6me=sNaiv clas        <d    iv>

         </d         </div>
    
          ></div                   </p>
            
       dback.de and feeir graion with theicatomatic notif autanill receive tudent w s         The   
          -700">-bluext"text-sm teName=<p class              </p>
      onNotificatiudent 0">Stblue-80text-ium t-med"text-sm fonsName=p clas  <                  
     <div>            />
 rink-0" ex-shfl-0.5 -600 mt-5 text-blueName="h-5 wircle class  <AlertC              -3">
  gap-start emslex it-4 fnded-lg pouue-200 r-blbordere-50 border ame="bg-bludiv classN  <           */}
    oxnfo B* I       {/       v>

    </di       >
              </p           
aracters} chback.length       {feed            t-1">
 0 m50gray-t-textext-xs lassName="       <p c           />
         
         "ove...prtudent imhe so help tk ttive feedbacide construcolder="Prov  placeh            
      -none"ze0 resider-blue-50ocus:borue-500 fring-blng-2 focus:riocus:nded-lg f0 rou30der-gray-2 border borpy-x-3 w-full pclassName="            
        ws={4}      ro          )}
    valuet.e.targeack(Feedb{(e) => setChange=    on               
 dback} value={fee                 rea
  ta     <tex             </label>
                  dback
 Fee               b-2">
    700 mray-ium text-g-sm font-medtextlock me="bl classNa   <labe         
           <div>        
   put */}ack In Feedb   {/*           

   </div>       }
              )              </p>
                  )}%
(1.toFixed) * 100)t.max_pointssignmenelectedAs / sloat(grade)((parseFe: {ercentag     P               ">
  500 mt-1xt-gray-"text-sm telassName=  <p c                & (
  grade)) &Float(!isNaN(parsegrade &&           {/>
                   )`}
       nts}_poimaxnment.ectedAssig-${sele (0radEnter golder={`   placeh              
   "-500er-blueus:bord500 foce-ng-blug-2 focus:rirind-lg focus: rounde00r-gray-3ordey-2 border bpx-3 pe="w-full    classNam            5"
     p="0.  ste                  x_points}
gnment.massidAx={selecte   ma                 "
"0    min=                
lue)}va.target.rade(e(e) => setGonChange={                   rade}
 value={g                  mber"
    type="nu             
      <input          el>
       /lab         <         oints}) *
ax_p.mnmentlectedAssig of {seade (out   Gr              
   ">-700 mb-2-grayum textnt-medi fo text-smame="block classNlabel           <        <div>
               ut */}
/* Grade Inp       {

         >/div      <      )}
                 v>
            </di          _name}
   .file.submissiongradingModal {       📎         >
      ue-600"m text-bltext-same="mt-2 <div classN                    e && (
le_namion.fissodal.submigMin{grad                ent}</p>
  .text_contonsil.submisoda{gradingM-pre-wrap">0 whitespaceay-60me="text-gr <p classNa         
        sion:</p>mistudent's Submb-2">S-gray-700 m textnt-mediu"text-sm fosName=<p clas              ">
    ed-lg p-4ound-gray-50 rbgName="ss claiv          <d*/}
       Preview ubmission   {/* S           ">
  space-y-4="p-6 className  <div             >

</div           no}</p>
   ssion.roll_gModal.submiin {gradname} -tudent_ubmission.sadingModal.s-1">{grmt0 ext-gray-60lassName="t     <p c         h2>
  n</ioisse Subm">Gradxt-gray-900ibold texl font-semme="text-<h2 classNa                -200">
er-gray bord-bborderme="p-6 iv classNa <d            auto">
 flow-y-vh] overmax-h-[90 w-full w-2xld-lg max-nde rou"bg-whiteame= <div classN      
     p-4">z-50 ter y-centifer jusems-cent flex itity-50acblack bg-op bg- inset-0ixed"fclassName=       <div 
   n && (.submissiogradingModal&& l.show {gradingModa      
   Modal */}ding{/* Gra

        /div>        <   )}
      ))
          
   /div>         <   </div>
          n>
          </butto               )}
              
       />  <                   
 rade Now    G            
        4" />4 w-ssName="h-  <Award cla                      <>
                       ) : (
                </>
                       
  ead   Edit Gr                   >
  -4 w-4" /me="hdit classNa         <E     
          <>                ? (
       'graded' n.status ===bmissio  {su            
               >         2 ml-4"
gap-ms-center rs flex itelotion-cosiue-700 tranbg-blver:ounded-lg ho px-4 py-2 rxt-whiteblue-600 te"bg-e=ssNam      cla         ion)}
     bmissodal(sungMopenGradi{() => k=   onClic            utton
        <b                   
           v>
      </di                   )}
            /div>
       <                  /p>
 ack}<dbbmission.feeap">{su-wrace-preitesp800 whblue-ext- ttext-sm" className=  <p                  k:</p>
    Feedbac-900 mb-1">blueedium text-ont-msm ftext-="className <p                     
   p-3">-lg rounded50 e-lu"bg-bssName=lav c      <di          && (
      eedback .f {submission                       
            
          </div>                  )}
                  />
           <           )}
                         
   div>   </                        pan>
 )}</sded_at.grasubmissionte(tDad: {formaadepan>Gr  <s                  
          w-4" />ame="h-4 k classN<Cloc                              
1">center gap-"flex items-me=ssNala     <div c                       & (
.graded_at &ion  {submiss                      v>
  di </                        /span>
  <                      %)
     toFixed(1)} * 100).ax_points)nt.msignmeelectedAs.grade / smission(sub ({(                     ">
        ay-500t-gr"texme= classNa<span                          an>
  ints}</spnment.max_possigelectedA}/{sission.gradebm {su>Grade:an  <sp                      />
    -4" 4 wName="h-ssd cla       <Awar                 
    dium">00 font-me-green-6 text gap-1enterflex items-cclassName="    <div                 <>
                         
     ned && (e !== undefiradubmission.g       {s              
             
             </div>             pan>
      t)}</s.submitted_aubmissiontDate(sed: {formatt<span>Submi                    >
     w-4" /ssName="h-4endar cla <Cal                       -1">
gapms-center iteex ="flclassName <div                   mb-3">
   t-gray-500 ex text-sm tr gap-4ms-centete"flex iName= class        <div        
                       iv>
 /d  <                        )}
                    </div>
                     </button>
                   load
      own  D                     >
     "h-3 w-3" /ssName=ad cla    <Downlo                       >
 p-1"nter gams-ceteline flex ir:underName="hoveassbutton cl      <                /span>
    me}<ion.file_naubmissspan>{s           <            -4" />
   h-4 wName="classFileText         <           ">
       00text-blue-6 text-sm center gap-2items--3 flex Name="mt<div class                   && (
     me e_naon.filsi     {submis              
                       t}</p>
  ntenion.text_cosubmisswrap">{tespace-pre-y-600 whi"text-gra className=      <p          >
      ission:</p mb-2">Submext-gray-700medium t font-smt-texName="  <p class                    >
-4 mb-3"d-lg proundeay-50 g-gre="bv classNam        <di                 
             l}</p>
  emain.student_missioub">{s00 mb-3-gray-6texte="text-sm p classNam       <             
                    </div>
                  an>
        </sp             eview'}
   ending R P: '⏳'✓ Graded' raded' ? tatus === 'gssion.submi{s                     }`}>
               
          low-700'xt-yel00 tew-1yello : 'bg-                      0' 
   een-70text-grgreen-100 bg-   ? '               ' 
        dedgraus === 'tatsubmission.s                    {
    t-medium $ text-xs fonded-full-2 py-1 rouname={`px<span classN                 span>
     no}</oll_n.rubmissioy-500">{ssm text-graame="text-lassNn c    <spa               e}</h4>
   t_namudenmission.stsub">{gray-900ld text-nt-semibo="foclassNameh4     <           >
       b-2"ap-3 mnter gtems-cex isName="fle   <div clas               ">
  ex-1Name="fldiv class <              
   ween">ustify-betart jms-st"flex iteName=ass     <div cl           shadow">
transition-md hadow- hover:s-6 py-200er-grardorder borounded-lg bte ame="bg-whiassNon._id} cl{submissi<div key=           n) => (
   ioubmiss.map((smissionsilteredSub          f (
    ) :          </div>
   p>
          </
           bmissions'} graded su      'No            
sions' :bmisg sundin pe? 'Nonding' === 'peus atrSt      filte        
   : s yet' mission ? 'No suball'tatus === 'erS       {filt      00">
   ay-6xt-gr"teme= classNa   <p           mb-4" />
400 mx-auto ray--12 text-g-12 wame="hclassNt ex    <FileT        er">
   text-centd-lg p-12-50 roundeme="bg-grayassNa cldiv     <? (
       th === 0 ions.lengbmissilteredSu {f
                 s</h3>
  missiont SubudenSt">t-gray-900ibold text-semext-lg fonssName="t     <h3 cla  -y-4">
   Name="spacessiv cla      <d
     </div>

        </button>  )
     graded}ats.d ({st     Grade  >
             
     }`}  
       gray-200' hover:bg-7000 text-gray-g-gray-10 : 'b          
     text-white'reen-600    ? 'bg-g        aded'
      'grs ===erStatu     filt   
      colors ${sition-tranum  font-medinded-lgoux-4 py-2 rame={`pssN       cla')}
     gradedtatus('terSetFil() => s  onClick={    on
          <butt     </button>
      
     ding})tats.penending ({s P              >
    }`}
              0'
 ray-20hover:bg-gy-700 -graray-100 text : 'bg-g           e'
    xt-whitow-600 te 'bg-yell    ?     '
        'pendingus ===erStat  filt          {
  n-colors $itioum transmedig font-d-lnde py-2 roume={`px-4  classNa         ing')}
 endus('perStat setFiltClick={() =>       on    <button
         /button>
            <total})
s. All ({stat                >
   
     }`}       -200'
  -graybgr:-700 hove00 text-gray'bg-gray-1          : 
      t-white'ue-600 tex    ? 'bg-bl  
          == 'all'atus =rSttefil             lors ${
 n-coum transitiog font-mediunded-l4 py-2 rosName={`px-    clas    )}
    us('all'atsetFilterSt> Click={() =        on     <button
>
         gap-4 mb-6"ems-center x itleassName="f     <div clbs */}
   er Talt{/* Fi   

      </div>iv>
            </dv>
       </di     
      </p>           
  s}` : 'N/A'}ntent.max_poiedAssignm1)}/${selected(gGrade.toFix{stats.ave > 0 ? `$.avgGrad      {stats   >
       le-900"ld text-purpont-boxt-2xl fssName="tecla <p        >
       </div           
  pan>g Grade</sium">Avfont-medxt-sm me="telassNa <span c              
 5" /> w-me="h-5lassNagUp c  <Trendin        1">
      600 mb--purple-extter gap-2 tex items-cen"flssName=   <div cla      
     -4">lg pded-roune-50 bg-purpl"me=div classNa <      
               iv>
      </d   }</p>
     nding{stats.pe">00llow-9bold text-ye-2xl font-"textsName=    <p clas     div>
          </         >
anng</spendiium">Pont-med-sm fame="textclassNspan         <         w-5" />
"h-5assName=ock cl   <Cl       1">
      -600 mb-xt-yellowp-2 teter gaex items-cename="flsN   <div clas           -lg p-4">
ed50 roundbg-yellow-ssName="v cladi           <     
    v>
       </di        
 d}</p>ats.graden-900">{st-greextt-bold tefonxt-2xl assName="tep cl       <      </div>
           
    pan>aded</s>Gr-medium"xt-sm fontassName="tepan cl      <s           w-5" />
sName="h-5Circle clasck<Che           ">
     en-600 mb-1 text-gregap-2-center "flex itemssName=div clas    <  >
        lg p-4"nded-n-50 roubg-greeassName=" cliv       <d
                 /div>
    <  </p>
      .total}900">{statsext-blue- t font-bold="text-2xlp className <             >
    </div          /span>
ssions<>Total Submimedium"font-xt-sm e="teamsN  <span clas       
        />="h-5 w-5" className  <Users         
     -1">lue-600 mb text-bgap-2er tems-cent"flex i= className<div            ">
  g p-4ded-l50 roun="bg-blue-sNamelasiv c       <d     ">
gap-44 cols--1 md:grid-olsd grid-c"gri className=div      < 
           </p>
  _title}.courseAssignmentectedrse: {sel mb-4">Couue-600xt-bl-sm teame="textssN cla         <p</p>
 on}riptinment.descssig">{selectedA00 mb-4ray-6-gext"t className=        <p/h2>
  t.title}<signmen>{selectedAsb-2"gray-900 mext-old txl font-btext-2assName="     <h2 cl-6">
     -200 p-6 mbborder-graylg border ite rounded-bg-whame="ssNladiv c    <
    v>
       </di>
   </button          Refresh
       
    : ''}`} />mate-spin'shing ? 'aniefre4 ${r{`h-4 w-assName=hCw cles<Refr               >
    s"
   ion-coloritd-lg trans50 roundeer:bg-blue-blue-600 hovtext--2 4 pyer gap-2 px--centx itemse="fle  classNam
          refreshing}disabled={           sh}
 handleRefreick={    onCl       <button
       
          >
    tton     </bu   
  signments Back to As           ←
           >ay-900"
er:text-gr600 hovy- text-graap-2 gtems-centerflex isName="       clasull)}
     Assignment(ntSelected seick={() => onCl             <button
       6">
 b-between mstify-er juitems-cent"flex sName= <div clas">
       -6sName="p<div clas
      n (ur 
    retnment);
   dAssigts(selectetabmissionSSuett stats = g   cons) {
 ignmentselectedAss}

  if (   );
  </div>
   >
    </div       ts...</p>
 mensignLoading asray-600">t-gtexsName="lasp c       <
   "></div>-auto mb-4rent mxtranspar-t-bordeer-blue-600 -4 bordborder12  w- h-12llounded-fu-spin rtee="animalassNam  <div c   
     nter">t-cetexame="iv classN     <d">
   -h-[400px]ter minjustify-cenems-center p-6 flex itsName="  <div clas    turn (

    reng) {loadi;

  if ([] || true;
  }) return aded';
   tus === 'grstasion.turn submisre= 'graded') atus ==rStif (filte';
     !== 'gradedssion.statusurn subminding') retus === 'pefilterStat   if (;
 eturn true== 'all') rterStatus =   if (fil
 {on => siilter(submisns?.fsubmissiont?.edAssignmeelect sssions =miredSubconst filte

  };
  };ing adingGrns, pendbmissiotalSunments, toalAssig{ totn 
    retur, 0);
    ;
    }.lengthaded') !== 'grtuss.sta => ter(s.filonssubmissi + a.return sum;
      eturn summissions) r if (!a.sub{
     >  =a)educe((sum, nts.rnme= assigngGrading endinst p);
    co 0 || 0),nton_cou(a.submissi sum +  a) =>educe((sum,ments.r= assignissions Submtal   const to;
 engthssignments.lnts = ameAssigntalonst to> {
    cts = () =llStaerast getOv
  con };
Grade };
  avgd, pending,adetal, grurn { to    ret0;
    

      : ns.lengthSubmissio) / graded, 0rade || 0) + (s.gs) => sumduce((sum, ons.remissi gradedSub ?h > 0
     ns.lengtissio= gradedSubme gGradonst av    cndefined);
.grade !== u=> s(s .filtersionsent.submisgnmsions = assimis gradedSub const
   aded;
     - gring = totalpendconst 
    ).length;ded'ra'gs === => s.status ilter(issions.f.submsignment graded = as  const.length;
  issionsnment.subm assignst total =   
    co0 };
 : , avgGradepending: 0d: 0, adeotal: 0, gr) return { tssionsbmint.susignme if (!as> {
   ) = Assignmentnt:signmenStats = (asubmissiotS
  const ge
  };
t'
    });'2-digi  minute: ,
    2-digit'ur: ' ho',
     numeric     day: ',
 nth: 'short',
      monumeric' year: 'S', {
     en-Ug('inocaleDateStrString).toLateDate(dreturn new  => {
    g)ng: strindateStrirmatDate = (
  const fo
}
  };   
 ();gnments   fetchAssi else {
   
    }nment._id);ctedAssigils(seleDetassignment   fetchA
   ment) {gnselectedAssi
    if (ng(true);setRefreshi {
    resh = () =>efandleR

  const h;
  };|| '')back mission.feedck(subsetFeedba');
    tring() || '.grade?.toSione(submiss    setGrad});
mission  subhow: true,gModal({ stGradin
    sesion) => { Submisubmission:odal = (singMnst openGrad co
  };
 }
 se);
   itting(fal   setSubmnally {
       } fide' });
t grato submiailed ge: 'Fr', messae: 'erroToast({ typ
      setrror);ission:', e submngrror gradi('Esole.error      conror) {
ch (er  } cat
  });
      }it grade' subm to  'Failedta.error ||e: daror', messag 'erype:setToast({ t
        .json();it responset data = awa     conselse {
   
      } 
        }gnment._id);selectedAssitDetails(gnmensi fetchAsit       awament) {
   tedAssign (selec    if   s
 tailment de assignRefresh    // 
          ;
  '')ck(tFeedba se     ;
  Grade('')     set});
   n: null iose, submiss: fal showadingModal({      setGr
  y!' });llfucessmitted suc 'Grade sube: messagccess',: 'sutypeetToast({ {
        sesponse.ok) if (r);

         }
        })
     ()
        imack.tr feedb   feedback:       ue,
  Valde: grade   gra     {
    y(stringify: JSON.      bod,
     }     /json'
    pplicationType': 'ant-  'Conte
          }`,{tokenrer $': `Beahorization        'Autrs: {
    eade h         d: 'POST',
   metho            {
  e`,
 adon._id}/grssisubmidal.Moingions/${grad/submissnmentsi/assig:5000/apocalhost://l   `httph(
     = await fetcst response  con
     Token(); = getAuthonst token
      c try {ue);
   tting(tr    setSubmi  }

rn;
        retu   });

   s}` ntt.max_poinmenssiglectedAseeen 0 and ${ust be betwGrade message: ` 
        mr',pe: 'erro      ty 
    setToast({ts) {
    ent.max_poinedAssignm > selectadeValue|| gr 0 adeValue <e) || grgradeValusNaN(    if (ie);
Float(gradrseue = pa gradeVal   const

  return;Assignment) !selectedmission ||odal.subingM!grad {
    if (() =>n = async iobmissdleGradeSu
  const han
  };

    }ails' });t detassignmenoad  lled toe: 'Faiessagor', merr type: 'setToast({
      ror);etails:', er dentssignmhing atcError fer('sole.erro     conrror) {
 (eh    } catc    }
 ls' });
   detaiassignmentd to load e: 'Failemessag 'error', oast({ type:       setT else {
 
      }assignment);(data.ssignmentedAsetSelect      );
  son(esponse.jit rata = awa    const d   e.ok) {
 f (respons

      i});           }
  
 /json'applicationent-Type': 'Cont     '
     token}`,`Bearer ${tion': rizautho         'A
  headers: {       ntId}`, {
${assignmeents/gnmpi/assihost:5000/a//localch(`http:it fetse = awanst responco     