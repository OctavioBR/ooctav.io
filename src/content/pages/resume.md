---
title: Resume
description: Octávio Richter, platform engineer with 15 years of web development experience, focused on cloud and Kubernetes.
headline: Platform Engineer
photo: ../../assets/photos/SF.JPEG
photoAlt: Octávio Richter in front of the Golden Gate Bridge
featured: 3

experience:
  - company: Grepr
    url: https://grepr.ai
    logo: ../../assets/logos/grepr.png
    location: San Francisco, California, United States
    workplace: Remote
    type: Contract
    roles:
      - title: Founding DevOps Engineer
        start: 2024-12
        end: 2026-09
        highlights:
          - Architected and implemented GitOps CI/CD pipelines with GitHub Actions and Terraform that reject code, infrastructure and data compatibility regressions.
          - Led AWS operations and infrastructure with Kubernetes, Helm and Terraform, with a focus on automation.
          - Cut EKS compute costs ~40% by improving autoscaling and bin packing with Karpenter.
          - "Built two self-hosted deployment options for Grepr, so customers can run it on-prem: a modular Terraform package that provisions the entire infrastructure in one shot, and an umbrella Helm chart that deploys into an existing Kubernetes cluster."

  - company: Pluto TV
    url: https://pluto.tv
    logo: ../../assets/logos/pluto-tv.png
    location: Los Angeles, California, United States
    workplace: Remote
    type: Contract
    roles:
      - title: Lead Platform Engineer
        start: 2023-12
        end: 2024-10
        highlights:
          - Led observability instrumentation of edge devices (Roku, Android, iOS) for real user monitoring.
          - Led a tool-assisted solution to unify service documentation, keeping docs continuously up to date and consistent across 20+ teams and 300+ services.
          - Core member of the Kubernetes platform team running high-volume clusters with ~150 TiB RAM and 20k cores in aggregate.

  - company: Funding Circle UK
    url: https://www.fundingcircle.com
    logo: ../../assets/logos/funding-circle.png
    location: Greater London, England, United Kingdom
    workplace: Hybrid
    type: Full-time
    roles:
      - title: SRE & DevEx Engineer
        start: 2022-03
        end: 2023-07
        highlights:
          - Migrated services from Mesos/Marathon to Kubernetes, reducing toil from legacy infrastructure.
          - Worked in the Developer Experience team, driving adoption of standard CI/CD workflows ("paved roads") with ArgoCD, DroneCI and Terraform across product teams.
          - Embedded with product engineering teams to find delivery bottlenecks and integrate their applications with the new cloud architecture, speeding up delivery and improving developer confidence.

  - company: Loft
    url: https://loft.com.br
    logo: ../../assets/logos/loft.png
    location: São Paulo, Brazil
    workplace: Remote
    type: Full-time
    roles:
      - title: Senior Software Engineer (SRE)
        start: 2021-12
        end: 2022-02
        highlights:
          - Worked on self-serve infrastructure where each team owned its AWS resources, and supported the migration of workloads from Kubernetes to ECS on Fargate.
          - Contributed to "Cloudnator", a Go-based system that orchestrates infrastructure and application provisioning on top of Pulumi stacks.

  - company: Grupo 3778
    url: https://3778.care
    logo: ../../assets/logos/3778.png
    location: Florianópolis, Santa Catarina, Brazil
    workplace: Hybrid
    type: Full-time
    roles:
      - title: Principal Platform Engineer
        start: 2020-12
        end: 2021-11
        highlights:
          - Served as technical reference for the platform team as the company grew through acquisitions into Grupo 3778, onboarding and mentoring new engineers.
          - Drove alignment with software and data engineering tech leads, and enabled a multi-tenant architecture with data infrastructure isolated per customer.
          - Led post-mortems, advised teams on monitoring and operations, and established zero-downtime deployments.
          - Helped build a small, high-leverage platform team that supported all engineering demands while steadily investing in platform architecture.
      - title: Site Reliability Engineer
        start: 2019-12
        end: 2020-12
        highlights:
          - Founded the 3-person Cloud Platform team, owning security, cloud automation, application scaling and monitoring, and core systems used by other engineering teams.
          - Led the company's migration from AWS to GCP and built Terraform automation that provisioned the entire infrastructure in GCP and AWS from scratch, organizing each team into its own GCP project.
          - Ran environments on GKE, Istio, Cloud Run, Cloud Tasks, Cloud SQL and Stackdriver.
          - Launched a single sign-on stack (oauth2-proxy + Auth0), solving authentication for all applications in the company service mesh.
          - Designed and built "3778 Send", a system for securely transferring files with customers.
          - Advised application teams on observability and reliability best practices.
      - title: Full Stack Engineer
        start: 2019-01
        end: 2019-12
        highlights:
          - Architected and led development of AI-powered and analytics applications that turned key customers like Syrian-Lebanese Hospital (São Paulo) into partners and sponsors of further tech initiatives.
          - Built "AI-doc", a diagnostic imaging application that supports physicians with AI-based annotations on DICOM images (Node.js microservices, Vue.js, Kong API gateway, AWS EKS).
          - "Re-architected \"Daher\", an analytics platform originally built on WordPress, Power BI and SurveyMonkey, into microservices: built an SPA with Mithril.js and LitElement, moved login to AWS Cognito, and wrote 6 backend services in Go from scratch."

  - company: Neoway Business Solutions
    url: https://www.neoway.com.br
    logo: ../../assets/logos/neoway.png
    location: Greater Florianópolis, Brazil
    workplace: Hybrid
    type: Full-time
    roles:
      - title: DevOps Engineer
        start: 2016-07
        end: 2019-01
        highlights:
          - Migrated the entire infrastructure from AWS to Azure in under 8 months, following a Microsoft partnership.
          - Brought Kubernetes to the company for the first time, automating cluster setup on hardened Linux VMs since strict security policies and on-premise environments ruled out managed AKS.
          - Shipped a GitOps CD strategy with GitLab, and automated provisioning, configuration and hardening with Terraform, Ansible and Packer.
          - Operated and advised on security (OWASP), observability and GDPR compliance, and drove internal testing and monitoring initiatives.
      - title: Software Engineer
        start: 2015-08
        end: 2016-07
        highlights:
          - Full-stack developer leading most frontend work on "Neoway Maps", an Angular SPA backed by Go APIs and workers, PostgreSQL, GeoServer and Elasticsearch.

  - company: Bravi Software
    logo: ../../assets/logos/bravi.png
    location: Greater Florianópolis, Brazil
    workplace: On-site
    type: Full-time
    roles:
      - title: Software Engineer
        start: 2013-03
        end: 2015-07
        highlights:
          - Re-architected Tribal Insight, a platform that predicts student failure in higher education, rebuilding it from an ASP.NET stack into Python and Node.js web services with an SPA.
          - Worked on its core learning-analytics platform, building models with scikit-learn, and built API-driven client apps with Marionette.js.
          - Practiced TDD in an Agile team.

  - company: Neoway Business Solutions
    url: https://www.neoway.com.br
    logo: ../../assets/logos/neoway.png
    location: Greater Florianópolis, Brazil
    workplace: On-site
    type: Part-time
    roles:
      - title: Business Intelligence
        start: 2011-08
        end: 2013-02
        highlights:
          - "Developed BI solutions in QlikView: designed data warehouses and ETL processes, and administered the BI server."
          - Worked directly with Neoway's end customers to gather requirements and design interactive dashboards.

education:
  - degree: Bachelor's Degree in Information Systems
    school: Federal University of Santa Catarina (UFSC)
    logo: ../../assets/logos/ufsc.png
    location: Florianópolis, Brazil
    end: 2016

skills:
  - group: Cloud, Containers & Observability
    items: [AWS, Google Cloud Platform (GCP), Microsoft Azure, Kubernetes, Helm, Docker, Datadog]
  - group: Infrastructure as Code & CI/CD
    items: [Terraform, GitHub Actions, GitLab CI, DroneCI, ArgoCD, GitOps]
  - group: Platform & Security
    items: [Developer Platforms, Developer Experience, Self-service Infrastructure, Cost Optimization, Single Sign-On, Auth0, OWASP, GDPR]
  - group: Languages & Frameworks
    items: [Go, TypeScript, Node.js, Python, Java]
  - group: Practices
    items: [SRE, Incident Post-mortems, Zero-downtime Deployments, Linux, Microservices, Web Architecture, TDD, Agile, Mentoring]

additional:
  - "[CKAD](https://training.linuxfoundation.org/certification/certified-kubernetes-application-developer-ckad/); [Linux Foundation individual supporter](https://www.linuxfoundation.org/about/individual-supporters)."
  - "Former organizer of [DevOpsDays](https://devopsdays.org/events/2019-florianopolis/welcome/) and [GopherCon](https://gopherconlatam.org/); talks and meetups."
  - "Fan of hackathons: Microsoft OpenHack SP, [Hacking Health SC](https://hacking-health.org/pt/santa-catarina-pt/), [Code in the Dark](http://floripa.codeinthedark.com.br/)."
  - Speaks Portuguese, English and Russian. Dual citizenship, Brazilian and Italian.
---

Software professional with 15 years of diverse web development experience, currently focusing on cloud and Kubernetes. An enthusiastic proponent of 12-factor, API-first and DevOps culture, I translate product and business requirements into scalable solutions. Best fit for **Platform Engineer** roles.
