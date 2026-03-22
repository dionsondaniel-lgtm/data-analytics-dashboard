import React, { useMemo, useState, useEffect } from 'react';
import { 
  OverallMetrics, Learner, TransformedAttendance, TransformedPractice, 
  TransformedProject, ViewType, AllCohortsPhoto, AlumniProject 
} from '../types';
import { 
  Users, BookOpen, Layers, FileText, CheckCircle, 
  Award, TrendingUp, Trophy, Zap, ArrowUpRight, 
  ImageIcon, Sparkles
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { BottomNav } from './BottomNav';
import { getDriveImageUrl, getHDImageUrl } from '../App';

interface HomeProps {
  metrics: OverallMetrics;
  learners: Learner[];
  attendanceData: TransformedAttendance[];
  practiceData: TransformedPractice[];
  projectData: TransformedProject[];
  cohortPhotos?: AllCohortsPhoto[];
  alumniProjects?: AlumniProject[];
  onNavigate: (view: ViewType) => void;
  currentView: ViewType;
}

export const Home: React.FC<HomeProps> = ({ 
  metrics, learners, attendanceData, practiceData, projectData, 
  cohortPhotos = [], alumniProjects = [], onNavigate, currentView 
}) => {
  
  // --- States for Auto-playing Gallery ---
  const [currentDisplayImage, setCurrentDisplayImage] = useState<string | null>(null);
  const [fade, setFade] = useState(true);

  const uniqueCohorts = new Set(learners.map(l => l.COHORT_NO).filter(Boolean)).size;
  const modules = ['SQL', 'EXCEL', 'PBI', 'PYTHON'];

  // --- Image Processing Logic ---
  const imagePool = useMemo(() => {
    // 1. Static URLs from the 4 cohorts provided
    const staticCohortUrls = [
      // 1st Cohort
      "https://drive.google.com/file/d/1g81_O0i5s9g11Q3WNMuZ82pClqiIh2En/view?usp=drive_link", "https://drive.google.com/file/d/1WmJUw9j2Okl22UIIcE4dJwXJgy8wKwyV/view?usp=drive_link", "https://drive.google.com/file/d/1fUjpvbDRuWzeww3A68TXaBf4t7_cLp_L/view?usp=drive_link", "https://drive.google.com/file/d/1ymiNFow3j_7y_InU6clSMOf4yu6RtbvA/view?usp=drive_link", "https://drive.google.com/file/d/1uHBEPPNHBqgCZxpJrcL-khX6fFA3la3O/view?usp=drive_link", "https://drive.google.com/file/d/11rJdZ4G2KOmUgM4k2Dm4i8DbN3l-OCM1/view?usp=drive_link", "https://drive.google.com/file/d/1ZlGAgWEdwRbqMx3D6cwZwOyP6jbxOdgJ/view?usp=drive_link", "https://drive.google.com/file/d/1JdI3smeqUzrKbzt4_LjpbfSM84tncbgG/view?usp=drive_link", "https://drive.google.com/file/d/1ekyWO5A7IwO4lybSuBeaTCXXzVD5p3E1/view?usp=drive_link", "https://drive.google.com/file/d/1WrfiO0GZ0uKW72LeDuvQsstb0tl3WzAf/view?usp=drive_link", "https://drive.google.com/file/d/1_mqxF76rRPRGA5QLFq2WFIFAXWVDiIxS/view?usp=drive_link", "https://drive.google.com/file/d/1D-RD_o35uIQKMRj6W8Gq4DbJ5cVIppEe/view?usp=drive_link", "https://drive.google.com/file/d/1gKb3wDTEH0dHLTCONSpPk8sjZeCUXsID/view?usp=drive_link", "https://drive.google.com/file/d/1l2k95-pL22twniAxgq-w-MtmikzTWKSC/view?usp=drive_link", "https://drive.google.com/file/d/1lOBs9n20E6DJgIdqZAZ5aCrkYQotOWuc/view?usp=drive_link", "https://drive.google.com/file/d/1UlhCobntxPgrlcEzeEULvtB3N8c-AxzA/view?usp=drive_link", "https://drive.google.com/file/d/1hXYqOpZkHIvBgti_iJ2nPtxrubzYzckm/view?usp=drive_link", "https://drive.google.com/file/d/1JHul1gFZoEHAcga-LMk6Y3r3rzI1rdsO/view?usp=drive_link", "https://drive.google.com/file/d/1mHqFXy4vGkwwHr4cT7iZx4hsUuHoxCI2/view?usp=drive_link", "https://drive.google.com/file/d/1Fj9uKNd6Ts_33pTpkGQ6Rm5FwCLdLkn0/view?usp=drive_link", "https://drive.google.com/file/d/1t8joFYJX5-Wc015mvSUTI48AcdwD3UtU/view?usp=drive_link", "https://drive.google.com/file/d/1J5v-77N-wM-cIIJk8ptf6zEBWRVTL6Vs/view?usp=drive_link", "https://drive.google.com/file/d/1m99nYxKj3hBwN1-vCy71w0Y9cBP2JcaD/view?usp=drive_link", "https://drive.google.com/file/d/14sesRyhGTBMYTQ8pFcYQsqioeLI_Mwxq/view?usp=drive_link", "https://drive.google.com/file/d/1eyFQwa1SxBtExOv3eWXf2LJOQsDoga_O/view?usp=drive_link", "https://drive.google.com/file/d/1K3_LYY0jq-IlDSsGrZnDMseTMEBSMyUy/view?usp=drive_link", "https://drive.google.com/file/d/1tCCT9G0b0La8zXmI-gkP78qJi2v7_6a0/view?usp=drive_link", "https://drive.google.com/file/d/1LL7P15iyu9RSiuvLU61HifI5KYRvbJst/view?usp=drive_link", "https://drive.google.com/file/d/1QgrcyaUYMwTyZ4PkN3OeYXLmw4Swc7bw/view?usp=drive_link", "https://drive.google.com/file/d/1RUke4NMo3ai_XhjVW4qkSE6PxN71GfUn/view?usp=drive_link", "https://drive.google.com/file/d/1X__wC3eh0OVaC5seNgzg4Zi86b45jC7C/view?usp=drive_link", "https://drive.google.com/file/d/1N0GsFDlaTfEXW6hsHIWJdcK1DzVUTvPa/view?usp=drive_link", "https://drive.google.com/file/d/1dr-KzVz5xSFi-BDi51QfAPf_I8eiO5Dz/view?usp=drive_link", "https://drive.google.com/file/d/1TIQE5YBVX1Q8YwKh6SFZbEF-69gPGpXG/view?usp=drive_link", "https://drive.google.com/file/d/1dv69OdLbz51_ian8Ue9L43GQGR4WFjsA/view?usp=drive_link", "https://drive.google.com/file/d/1NiGL5vdgQigPaT51X60Q_rVgobiF5KZ-/view?usp=drive_link", "https://drive.google.com/file/d/1Yeki7RCEg-GW1F_x_RUYreqsvHLaFrFM/view?usp=drive_link", "https://drive.google.com/file/d/13mmBogfBecP4X53_alsTxr2MZA6GEauN/view?usp=drive_link", "https://drive.google.com/file/d/10ob05p230cUWBrabjkf_TOG2SyyOpfkO/view?usp=drive_link", "https://drive.google.com/file/d/14pJ54nf4YY3UKmuVLf9EvrIzwfi7nU6R/view?usp=drive_link",
      // 2nd Cohort
      "https://drive.google.com/file/d/1-qrbSDKgPtar_lfHTxki8gSiVtlNogsC/view?usp=drive_link", "https://drive.google.com/file/d/1MApdpYiMhL_-ux9o9vKVMuhZoM7Nyqeb/view?usp=drive_link", "https://drive.google.com/file/d/1KD4zkZZ0xPCC7lnMIP0RMD_QK3C7hGP4/view?usp=drive_link", "https://drive.google.com/file/d/1DsrFn7pBOZCtOWW3vl9Gq2MKJ2b7W0mY/view?usp=drive_link", "https://drive.google.com/file/d/1TsKKcNmemamspr9Nl-aCTuGyUNHDhrM4/view?usp=drive_link", "https://drive.google.com/file/d/1FC5kHUk68sNIj-KlCWzmr2Wh3JaWA8iE/view?usp=drive_link", "https://drive.google.com/file/d/1qabrp0WYAOjTo8afQsG_k_6Sw4O5xu9c/view?usp=drive_link", "https://drive.google.com/file/d/1Uiai-UlasKxF_3vbj6gnA7Bm4W1iZa61/view?usp=drive_link", "https://drive.google.com/file/d/1uxthHlJmyKXCQf39z0f5Qlc1fghop0Hy/view?usp=drive_link", "https://drive.google.com/file/d/18DxyW_scBimrNtbNDeYdt_hXhXF52o0a/view?usp=drive_link", "https://drive.google.com/file/d/12_6mhxoRvAQkCAKey6SJAPa_yywuISNd/view?usp=drive_link", "https://drive.google.com/file/d/1tc31UxTmbB3t2azGxK9SSz5khb2VaG8z/view?usp=drive_link", "https://drive.google.com/file/d/1CtvrFCKz3fUT4sNIRBCdN_1FrggCrT7E/view?usp=drive_link", "https://drive.google.com/file/d/1gh7WnvXLxgh3REtyiybUqgoNUPTIhIS0/view?usp=drive_link", "https://drive.google.com/file/d/1s17qPL1ceIz4wQO18F4qGlxtn3grOwkr/view?usp=drive_link", "https://drive.google.com/file/d/1vF9XhbKAWkkbCPGMC_xDfj1CRIvVQApM/view?usp=drive_link", "https://drive.google.com/file/d/1uH-muv6XPmQp2EOUAjEDgYuhAYBF63ru/view?usp=drive_link", "https://drive.google.com/file/d/1P2fy4TjNeX8ycB2sCZj58n8PMkPJDtyn/view?usp=drive_link", "https://drive.google.com/file/d/1bm6IHQ2TbTXLOgMl4Fn0bWvcfRjuw181/view?usp=drive_link", "https://drive.google.com/file/d/1PMfShSZItkVUlbEtpSmKfwdlTF1Gp45E/view?usp=drive_link", "https://drive.google.com/file/d/1TFozk5XjCG3sGOrUEbk8tXlDM7Am3IRq/view?usp=drive_link", "https://drive.google.com/file/d/1nmbXK6hNNxQzadzHN6erOCY6oy4MzrVk/view?usp=drive_link", "https://drive.google.com/file/d/12NLeklWoOapncglmmt-QNcK5NNTMH_tf/view?usp=drive_link", "https://drive.google.com/file/d/1oVBrXs-dwlBGeh7hdAh_63YZu99UsUwI/view?usp=drive_link", "https://drive.google.com/file/d/1P7BJcNF5yTShHzGWD7c7S8M1lpjN37zS/view?usp=drive_link", "https://drive.google.com/file/d/1SNDVyCzU1FOfGKPWuQsZmBWPr3NPPFob/view?usp=drive_link", "https://drive.google.com/file/d/1B5SwNMk2CMs5ZfWwYS7gj0VTuDTZOfB1/view?usp=drive_link", "https://drive.google.com/file/d/1JEBA8yvYufK9nxWgJwl263pOCjBAuF55/view?usp=drive_link", "https://drive.google.com/file/d/1WQGVjFcyxPcZ50Y2PS63TbOXxSJcgAy8/view?usp=drive_link", "https://drive.google.com/file/d/18j2pu6_rXoX9fJIw1ZfJkvKA6XCZem4f/view?usp=drive_link", "https://drive.google.com/file/d/1o7vbOyHswLXwT8sJaooSpcRQwLcuS0Zm/view?usp=drive_link", "https://drive.google.com/file/d/1BYvyEw5f7tB0A1_DezuccIftOrEa6Eqz/view?usp=drive_link", "https://drive.google.com/file/d/1ihLTdngTtshII6YPGlNhfUpZu40brf4d/view?usp=drive_link", "https://drive.google.com/file/d/1amenZPcM3SKJVkrhY2SRGctQi0m0D-0B/view?usp=drive_link", "https://drive.google.com/file/d/1GEX4cc5Kldo_hieUkx27FSg5nU3-jwBQ/view?usp=drive_link", "https://drive.google.com/file/d/1SCwLJGfwx6Wuw7s_k-TFOCH5KY3M-hyE/view?usp=drive_link", "https://drive.google.com/file/d/1Rlol3I4axKyFqnGgOTvEA3UpYppP0xTu/view?usp=drive_link", "https://drive.google.com/file/d/1eRugwg8v1ydtsh2lbseYcxwxfu3OWVbd/view?usp=drive_link", "https://drive.google.com/file/d/1IpE6bFyGpAZQiZvwblUoTWRjrhpDmKlz/view?usp=drive_link", "https://drive.google.com/file/d/1L2prGZ1xFLi3BTJenqI2BQTuiRonNVob/view?usp=drive_link", "https://drive.google.com/file/d/1SLgjzHgTsAA61Z7imwYb3rByBsplTkZO/view?usp=drive_link", "https://drive.google.com/file/d/1yW-GI8hQhfgS0Ghn3QsuzOU1BAq2Knln/view?usp=drive_link", "https://drive.google.com/file/d/1zWO5JKGpozh25EuReP8h7oXUZ5RJ55sf/view?usp=drive_link", "https://drive.google.com/file/d/1_Mpi681tZ4inFzFIav1IWKBWlgDA5oUg/view?usp=drive_link", "https://drive.google.com/file/d/1EborkACx4pgdIIVPe_Zq-4jc5iGpg1jR/view?usp=drive_link", "https://drive.google.com/file/d/1C-pOUHtjZXdEkCacm2SMlxgKm6tSxWc-/view?usp=drive_link", "https://drive.google.com/file/d/16yb-ZdvzLIhDePCm_zY1qPwi-PluHfaw/view?usp=drive_link", "https://drive.google.com/file/d/1NARZWYzpGURB0VLL0XQfAsYNf3-FXNEV/view?usp=drive_link", "https://drive.google.com/file/d/1xgAnBK249nd-Bm5g5_FvoDUQ9IlLv2sV/view?usp=drive_link", "https://drive.google.com/file/d/1oI4W9armtWCgUj2Mv5CIuhkAmWZ9tEXy/view?usp=drive_link",
      // 3rd Cohort
      "https://drive.google.com/file/d/1Jf_F1u0Kcs6vpJB6S5zozzKHex0Iud_0/view?usp=drive_link", "https://drive.google.com/file/d/1Tdf6PxdJYu237ddybPm9sZcxwBit55BH/view?usp=drive_link", "https://drive.google.com/file/d/1IXn4kYSgKfrABYzmQUpxXwlqqNtTK_Hm/view?usp=drive_link", "https://drive.google.com/file/d/1x931QWTldaBpjGKXCAL1TKl-BkPQZahh/view?usp=drive_link", "https://drive.google.com/file/d/1xdK8vURq0W4_f8l0zzHfysz5MRXo6EYC/view?usp=drive_link", "https://drive.google.com/file/d/1aMrJptfwB3NwuYssvRbig8Uqh7sj9NVP/view?usp=drive_link", "https://drive.google.com/file/d/1YoWmWUaEo1s8zY1opnsncl2Jx3sVMYP2/view?usp=drive_link", "https://drive.google.com/file/d/1XVc_Q_VXdeMwuBzbiXXyj9laPqLxJpxZ/view?usp=drive_link", "https://drive.google.com/file/d/1PeIoc1aOJ3QwpAjEcob0yDhGBXhbdr6d/view?usp=drive_link", "https://drive.google.com/file/d/1QWurFqdFglQsAsLTKeRTOpOfdFjMSXDu/view?usp=drive_link", "https://drive.google.com/file/d/1Slz0aic1r5ME2QjdDmEy7AgNnMnHAW_Q/view?usp=drive_link", "https://drive.google.com/file/d/1TAUPOzfTODvSh9Cf8BHSLshxFfyd6qPe/view?usp=drive_link", "https://drive.google.com/file/d/1jVf1ToyBEjoNcW12HXlRPchXergzeQdC/view?usp=drive_link", "https://drive.google.com/file/d/1Km2KTIehT7sCUqQlhuUoR1QrOtVfavX7/view?usp=drive_link", "https://drive.google.com/file/d/1qbOFyFhwCsFxOQqlbdCanMdVUm1igXU8/view?usp=drive_link", "https://drive.google.com/file/d/1_KW33WmmKcD1lNZnBZif_UU5i4T6oJL3/view?usp=drive_link", "https://drive.google.com/file/d/1SyktA4WQnjSbzpeQD8QDgpL6oJ0CVrN3/view?usp=drive_link", "https://drive.google.com/file/d/13HToqK2PYDMrBEwOkB-cGfQTG7BvneF7/view?usp=drive_link", "https://drive.google.com/file/d/1cKLZh6mLRU8GdySxOXl0afZSfM1oyQZx/view?usp=drive_link", "https://drive.google.com/file/d/17-KDnv2WsliM0H0inyUbbzBrD4X-OyWq/view?usp=drive_link", "https://drive.google.com/file/d/1nf8UGb63NBiLlqLZBQiH63qfsZNHliU8/view?usp=drive_link", "https://drive.google.com/file/d/1-ppuVN2qVOtrgoNtmRnGBd_BhZLSnphh/view?usp=drive_link",
      // 4th Cohort
      "https://drive.google.com/file/d/1iU9iZe2EF3S249qqTrfYw6K5pCQipkjO/view?usp=drive_link", "https://drive.google.com/file/d/1DRxGEw2SNIgml71FEZQz2SUMCUH4MABD/view?usp=drive_link", "https://drive.google.com/file/d/11E6NHYBTBl9SIFPhpcCUm8VFyyqgxnu_/view?usp=drive_link", "https://drive.google.com/file/d/1xLuFFaqX1kZypu3U5jk8DfQhxdxtTGaI/view?usp=drive_link", "https://drive.google.com/file/d/1vqkiwUGZvS9aenEWzA5dnDujAg2St13Y/view?usp=drive_link", "https://drive.google.com/file/d/15mipYtFKWa0xYsg2Rnt5Rfnf8QvEQWj1/view?usp=drive_link", "https://drive.google.com/file/d/1NSe4za2m1QAAucFrkAoObddozbnzrZD5/view?usp=drive_link", "https://drive.google.com/file/d/1Mp5pKZ_AH-JgW6EhIjFWSoVkF0iSfRBx/view?usp=drive_link", "https://drive.google.com/file/d/17cZOTd-SNpbjIDiVTpv_mtVqtcGrjAXr/view?usp=drive_link", "https://drive.google.com/file/d/15sYPs-XlylMSDdqYBmWbgZ_kyPCPkrf6/view?usp=drive_link", "https://drive.google.com/file/d/15Lp5Wydj_eBU3CWvsRNxanMzasUIPtYG/view?usp=drive_link", "https://drive.google.com/file/d/11-mTnHuW98LDb8OPIG7oWULYqKuHBada/view?usp=drive_link", "https://drive.google.com/file/d/1MIopWtr9hXkPX1xcBuvdJHKtEMoE5bLE/view?usp=drive_link", "https://drive.google.com/file/d/1B0rbl2Lrh0qOCgsjw681uqCjFXuVoft_/view?usp=drive_link", "https://drive.google.com/file/d/1DXiMcV6tspJeO7LV15cXbdXeYnuetLDb/view?usp=drive_link", "https://drive.google.com/file/d/1fukW8u3yorO6ZRvKiHbXXMRVHM42aTwq/view?usp=drive_link", "https://drive.google.com/file/d/1fXQVCrYUAZnh24Ul25MB30qCSTKr69vt/view?usp=drive_link", "https://drive.google.com/file/d/1yHP0JP75Mk5PnaC8y6D1Jm9Tuby88NsS/view?usp=drive_link", "https://drive.google.com/file/d/1t4zQ3fbWnCH0gcxr94yPomxzKPszyjum/view?usp=drive_link", "https://drive.google.com/file/d/1U0XH8z_eeyTvDTaad78MH-ONiquuWIR2/view?usp=drive_link", "https://drive.google.com/file/d/1FUyfMXRCnqkLovgNT-zgiOJK9KQzClwI/view?usp=drive_link", "https://drive.google.com/file/d/1bkEwdnuTlhQvfWT5xAGm48y8Ur0kRZGz/view?usp=drive_link", "https://drive.google.com/file/d/1QD1hvYd0InuRyoC_gP4oemr6wpfyfhlg/view?usp=drive_link"
    ];

    // 2. Dynamic URLs from props
    const dynamicCohortUrls = cohortPhotos.map(p => p.IMAGE_URL).filter(Boolean);
    const dynamicProjectUrls = alumniProjects.map(p => p.Project_Image_Url).filter(Boolean);
    
    // 3. Combine everything
    const allUrls = [...staticCohortUrls, ...dynamicCohortUrls, ...dynamicProjectUrls];
    
    // 4. Transform to high-res streaming format
    return allUrls
      .map(url => {
        const driveIdUrl = getDriveImageUrl(url);
        return getHDImageUrl(driveIdUrl) || url;
      })
      .filter(url => url && url.length > 20); // Basic validation
  }, [cohortPhotos, alumniProjects]);

  // --- Random Stream Timer Logic ---
  useEffect(() => {
    if (imagePool.length === 0) return;

    const streamRandomPhoto = () => {
      setFade(false);
      setTimeout(() => {
        // Pick a truly random image from the pool
        const randomIndex = Math.floor(Math.random() * imagePool.length);
        setCurrentDisplayImage(imagePool[randomIndex]);
        setFade(true);
      }, 500); 
    };

    // Initial trigger
    if (!currentDisplayImage) streamRandomPhoto();

    // Loop every 5 seconds
    const interval = setInterval(streamRandomPhoto, 5000); 
    return () => clearInterval(interval);
  }, [imagePool, currentDisplayImage]);

  // --- Analytics Calculations ---
  const moduleEngagementData = useMemo(() => {
    return modules.map(m => {
      const data = attendanceData.filter(d => d.MODULE.toUpperCase().includes(m));
      const avg = data.length > 0 
        ? data.reduce((sum, curr) => sum + curr.Attendance_Rate, 0) / data.length 
        : 0;
      return { name: m, val: Math.round(avg) };
    });
  }, [attendanceData]);

  const cohortDistribution = useMemo(() => {
    const cohorts = Array.from(new Set(learners.map(l => l.COHORT_NO).filter(Boolean))).sort();
    return cohorts.map(cohort => ({
      name: `C-${cohort}`,
      students: learners.filter(l => l.COHORT_NO === cohort).length
    }));
  }, [learners]);

  const topCohort = useMemo(() => {
    const cohorts = Array.from(new Set(projectData.map(p => p.COHORT_NO)));
    if (cohorts.length === 0) return null;
    const performance = cohorts.map(c => {
      const projects = projectData.filter(p => p.COHORT_NO === c && p.GPA > 0);
      const avgGPA = projects.length > 0 ? projects.reduce((sum, curr) => sum + curr.GPA, 0) / projects.length : 0;
      return { id: c, score: avgGPA };
    });
    return performance.sort((a, b) => b.score - a.score)[0];
  }, [projectData]);

  const totalSubmissions = practiceData.reduce((sum, p) => sum + p.Total_Submitted, 0);

  return (
    <div className="min-h-screen p-2 sm:p-4 pb-24 space-y-6 bg-cover bg-center bg-no-repeat transition-all duration-500" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2029&auto=format&fit=crop")' }}>
      <div className="bg-white/90 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl md:rounded-[2.5rem] shadow-2xl border border-white/20 dark:border-gray-700/50 p-4 sm:p-8 min-h-[80vh] flex flex-col">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight">Home Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium text-sm md:text-base">Data Analytics Program Overview</p>
          </div>
          <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 p-2 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 w-fit">
            <div className="p-2 bg-indigo-500 rounded-lg text-white"><Zap size={20} /></div>
            <div className="pr-4 text-left">
              <p className="text-[10px] font-bold text-gray-400 uppercase">Live Pulse</p>
              <p className="text-xs md:text-sm font-bold dark:text-white">System Synchronized</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
          {/* Left Column */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            
            {/* Charts Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-[2rem] p-6 shadow-xl border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Module Engagement</h3>
                  <TrendingUp className="text-indigo-500" size={20} />
                </div>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={moduleEngagementData}>
                      <defs>
                        <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 600}} />
                      <YAxis axisLine={false} tickLine={false} domain={[0, 100]} />
                      <Tooltip contentStyle={{borderRadius: '16px', border: 'none'}} />
                      <Area type="monotone" dataKey="val" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorVal)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-[2rem] p-6 shadow-xl border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Cohort Population</h3>
                  <Users className="text-emerald-500" size={20} />
                </div>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={cohortDistribution}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 600}} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{borderRadius: '16px', border: 'none'}} />
                      <Bar dataKey="students" fill="#10b981" radius={[10, 10, 0, 0]} barSize={30} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Stats Cards & Leaderboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Enrollees', val: learners.length, icon: Users, color: 'bg-blue-500' },
                  { label: 'Cohorts', val: uniqueCohorts, icon: Layers, color: 'bg-emerald-500' },
                  { label: 'Modules', val: '4', icon: BookOpen, color: 'bg-purple-500' },
                  { label: 'Submissions', val: totalSubmissions, icon: FileText, color: 'bg-amber-500' }
                ].map((stat, i) => (
                  <div key={i} className="bg-white dark:bg-gray-800 p-5 rounded-[2rem] border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center text-center shadow-lg hover:scale-105 transition-transform group">
                    <div className={`p-3 ${stat.color} rounded-2xl text-white mb-3 shadow-md`}>
                      <stat.icon size={20} />
                    </div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">{stat.label}</p>
                    <p className="text-2xl font-black text-gray-900 dark:text-white">{stat.val}</p>
                  </div>
                ))}
              </div>
              
              <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden flex flex-col justify-center border border-white/10">
                <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                <div className="relative z-10">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                      <Trophy className="text-yellow-400" size={24} />
                    </div>
                    <h3 className="text-xl font-black uppercase tracking-tight">Cohort Leaderboard</h3>
                  </div>
                  <div className="space-y-1 mb-6">
                    <p className="text-sm font-bold text-white/70 uppercase">Top Performing Batch</p>
                    <p className="text-4xl font-black">Cohort {topCohort?.id || 'N/A'}</p>
                  </div>
                  <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${(topCohort?.score || 0) * 100}%` }} />
                  </div>
                  <div className="mt-6 flex items-center justify-between">
                    <div className="text-center">
                      <p className="text-[10px] font-bold text-white/60 uppercase">Avg GPA</p>
                      <p className="text-lg font-black">{((topCohort?.score || 0) * 100).toFixed(1)}%</p>
                    </div>
                    <button onClick={() => onNavigate('Projects')} className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-colors border border-white/10">
                      <ArrowUpRight size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* --- FIXED: HD RANDOM PHOTO STREAM --- */}
            <div className="relative group overflow-hidden rounded-[2.5rem] bg-gray-900 aspect-video md:aspect-[21/9] shadow-2xl border border-white/10">
              {currentDisplayImage ? (
                <div className={`w-full h-full transition-opacity duration-1000 ease-in-out ${fade ? 'opacity-100' : 'opacity-0'}`}>
                  <img 
                    src={currentDisplayImage} 
                    alt="Cohort Moment" 
                    className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-[12s] ease-linear"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop`;
                    }}
                  />
                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                  
                  {/* Floating Content */}
                  <div className="absolute bottom-6 left-6 md:bottom-8 md:left-10">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1.5 bg-rose-500 rounded-lg shadow-lg">
                        <Sparkles className="text-white w-4 h-4" />
                      </div>
                      <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black text-white uppercase border border-white/20 tracking-widest">
                        High Res Stream
                      </span>
                    </div>
                    <h4 className="text-xl md:text-3xl font-black text-white tracking-tight">Program Memories</h4>
                    <p className="text-white/60 text-xs md:text-sm font-medium mt-1">Randomized capture from {imagePool.length} memories...</p>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-white/20 gap-4">
                  <ImageIcon size={48} className="animate-pulse" />
                  <p className="text-sm font-black uppercase tracking-[0.2em]">Syncing Drive Library...</p>
                </div>
              )}
              
              {/* Progress Bar Sync */}
              <div className="absolute bottom-0 left-0 h-1.5 bg-rose-500/20 w-full">
                <div key={currentDisplayImage} className="h-full bg-rose-500 shadow-[0_0_10px_#f43f5e] animate-[progress_5s_linear_forwards]" />
              </div>
            </div>

          </div>

          {/* Right Column */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-[2rem] p-8 shadow-xl border border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-black text-gray-900 dark:text-white mb-1">Completion Rates</h2>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-8">Performance Benchmark</p>
              <div className="space-y-6">
                {[
                  { label: 'Attendance', val: metrics.Overall_Attendance_Rate, color: 'text-emerald-500', icon: CheckCircle, bg: 'bg-emerald-500/10' },
                  { label: 'Submissions', val: metrics.Overall_Submission_Rate, color: 'text-blue-500', icon: FileText, bg: 'bg-blue-500/10' },
                  { label: 'GPA Score', val: metrics.Average_GPA * 100, color: 'text-purple-500', icon: Award, bg: 'bg-purple-500/10' }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center space-x-4 text-left">
                      <div className={`p-2 rounded-xl ${item.bg} ${item.color}`}><item.icon size={20} /></div>
                      <span className="font-bold text-gray-700 dark:text-gray-200 text-sm">{item.label}</span>
                    </div>
                    <span className={`text-lg font-black ${item.color}`}>{item.val.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-[2rem] p-8 shadow-xl border border-gray-100 dark:border-gray-700 flex-1">
              <h3 className="text-lg font-black text-gray-900 dark:text-white mb-6 uppercase tracking-tight">Active Curriculum</h3>
              <div className="grid grid-cols-2 gap-4 mb-8">
                {modules.map(mod => (
                  <div key={mod} className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-transparent hover:border-indigo-500 transition-all cursor-default">
                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center mb-3 text-indigo-600 font-black text-xs">
                      {mod.substring(0, 3)}
                    </div>
                    <span className="text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-tighter">{mod}</span>
                  </div>
                ))}
              </div>
              <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Cohort Distribution</h3>
              <div className="space-y-4">
                {cohortDistribution.map(c => (
                  <div key={c.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-gray-600 dark:text-gray-400">{c.name}</span>
                      <span className="text-gray-900 dark:text-white font-black">{c.students} Learners</span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.5)]" style={{ width: `${(c.students / learners.length) * 100}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
      
      <BottomNav currentView={currentView} onNavigate={onNavigate} />
    </div>
  );
};