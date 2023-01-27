***********************************************************************    
*  Project           : /general/biostat/jobs/utils    
*  Program           : multi_path.sas    
*  Author            : jbodart    
*  Creation Date     : 2021-11-15    
*  Purpose           : Run programs specified as prog1-prog9 parameters 
*                      of /general/biostat/jobs/utils/dev/jobs/multi_path.job
*
*  Revision History     
*     
*  Date       Author          Revision     
*     
*     
***********************************************************************;   
%setenv(ini=0);
 
%macro loop;
   %*- from job parameters (global macro-variables) key_val<i> matching pattern: key=value, create macro-variable key<i> with value val<i> (for <i> in 1:20) -*;
   %local _i_ _macvar_ _sttmt_;
   %do _i_=1 %to 20;
      %global key_val&_i_;
      %if %sysfunc(prxmatch(/^ *[_A-Za-z]\w+ *=.*$/, %superq(key_val&_i_))) %then %do;
         %let _macvar_ = %qsysfunc(prxchange(s/^ *([_A-Za-z]\w+) *=.*$/\1/, 1, %superq(key_val&_i_)));
         %global &_macvar_;
         %let _sttmt_ = %qsubstr('%', 2, 1)let %superq(key_val&_i_)%qsubstr(';', 2, 1);
         %put %superq(_sttmt_);
         %unquote(%superq(_sttmt_));
      %end;
   %end;
%mend loop;
%loop;

%*- JMB 2022-03-08 - assign librefs to job parameters path1..path99 -*;
%macro loop;
   %*- from job parameters (global macro-variables) key_val<i> matching pattern: key=value, create macro-variable key<i> with value val<i> (for <i> in 1:20) -*;
   %local _i_ _macvar_ _sttmt_;
   %do _i_=1 %to 99;
      %if %symexist(path&_i_) %then %do;
          %if %length(%superq(path&_i_)) %then %do;
             LIBNAME path&_i_ %sysfunc(quote(%superq(path&_i_))) CVPMULTIPLIER=2;
          %end;
      %end;
   %end;
%mend loop;
%loop;


%*- assign libref out according to job parameter  (global macro-variable) outpath -*;
%global outpath;
%put Does &=outpath exist: %sysfunc(fileexist(%superq(outpath)));
%if %length(%superq(outpath)) and %sysfunc(fileexist(%superq(outpath))) %then %do;
   libname out %sysfunc(quote(%superq(outpath))) compress=yes;
%end;


%*- include successively up to 10 programs passed as parameters prog<i> -*;
%global prog1 prog2 prog3 prog4 prog5 prog6 prog7 prog8 prog9;

%if %length(%superq(prog1)) %then %do;
   %put %str(Not)ice: Including prog1=%superq(prog1);
   %include %sysfunc(quote(%superq(prog1)));
%end;

%if %length(%superq(prog2)) %then %do;
   %put %str(Not)ice: Including prog1=%superq(prog2);
   %include %sysfunc(quote(%superq(prog2)));
%end;

%if %length(%superq(prog3)) %then %do;
   %put %str(Not)ice: Including prog1=%superq(prog3);
   %include %sysfunc(quote(%superq(prog3)));
%end;

%if %length(%superq(prog4)) %then %do;
   %put %str(Not)ice: Including prog1=%superq(prog4);
   %include %sysfunc(quote(%superq(prog4)));
%end;

%if %length(%superq(prog5)) %then %do;
   %put %str(Not)ice: Including prog1=%superq(prog5);
   %include %sysfunc(quote(%superq(prog5)));
%end;

%if %length(%superq(prog6)) %then %do;
   %put %str(Not)ice: Including prog1=%superq(prog6);
   %include %sysfunc(quote(%superq(prog6)));
%end;

%if %length(%superq(prog7)) %then %do;
   %put %str(Not)ice: Including prog1=%superq(prog7);
   %include %sysfunc(quote(%superq(prog7)));
%end;

%if %length(%superq(prog8) %then %do;
   %put %str(Not)ice: Including prog1=%superq(prog8);
   %include %sysfunc(quote(%superq(prog8)));
%end;

%if %length(%superq(prog9)) %then %do;
   %put %str(Not)ice: Including prog1=%superq(prog9);
   %include %sysfunc(quote(%superq(prog9)));
%end;

%programend;
