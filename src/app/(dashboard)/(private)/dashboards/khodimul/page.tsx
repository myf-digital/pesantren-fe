'use client'

import React, { useEffect } from 'react'

import Grid from '@mui/material/Grid2'
import Card from '@mui/material/Card'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

import { Accordion, AccordionSummary, AppBar, Tab, Tabs, AccordionDetails } from '@mui/material'

import { useAppDispatch } from '@/redux-store/hook'

import { fetchCabangAll } from '../../app/cabang/slice'
import { fetchLembagaFormalAll } from '../../app/lembaga-formal/slice'
import { fetchLembagaAll } from '../../app/lembaga-kepesantrenan/slice'

import Kepesantrenan from './Kepesantrenan'
import LembagaFormal from './LembagaFormal'

interface TabPanelProps {
  children?: React.ReactNode
  dir?: string
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  )
}

function a11yProps(index: number) {
  return {
    id: `full-width-tab-${index}`,
    'aria-controls': `full-width-tabpanel-${index}`
  }
}

const Dashboard = () => {
  const dispatch = useAppDispatch()

  const [value, setValue] = React.useState(0)
  const [cabang, setCabang] = React.useState<any>([])
  const [lembagaFormal, setLembagaFormal] = React.useState<any>([])
  const [lembaga, setLembaga] = React.useState<any>([])
  const [mountedAccordion, setMountedAccordion] = React.useState<any>('')

  const getDataCabang = async () => {
    const res = await dispatch(fetchCabangAll({})).unwrap()
    const { data } = res

    if (data) {
      setCabang(data)
    }
  }

  const getDataLembagaFormal = async () => {
    const res = await dispatch(fetchLembagaFormalAll({})).unwrap()
    const { data } = res

    if (data) {
      setLembagaFormal(data)
    }
  }

  const getDataLembaga = async () => {
    const res = await dispatch(fetchLembagaAll({})).unwrap()
    const { data } = res

    if (data) {
      setLembaga(data)
    }
  }

  useEffect(() => {
    getDataCabang()
    getDataLembagaFormal()
    getDataLembaga()
  }, [])

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue)
  }

  return (
    <Grid container spacing={6}>
      <Grid size={12}>
        <Card sx={{ p: 5, overflow: 'visible' }}>
          <Box sx={{ flexWrap: 'wrap' }}>
            <AppBar position='static' color='transparent'>
              <Tabs
                value={value}
                onChange={handleChange}
                variant='scrollable'
                scrollButtons
                allowScrollButtonsMobile
                aria-label='scrollable force tabs example'
              >
                <Tab label='Kepesantrenan' sx={{ fontWeight: 600, fontSize: '1.2rem' }} {...a11yProps(0)} />
                <Tab label='Pendidikan Formal' sx={{ fontWeight: 600, fontSize: '1.2rem' }} {...a11yProps(1)} />
                <Tab label='Pendidikan Non-Formal' sx={{ fontWeight: 600, fontSize: '1.2rem' }} {...a11yProps(2)} />
              </Tabs>
            </AppBar>
            <TabPanel value={value} index={0}>
              {cabang.map((r: any, index: number) => {
                return (
                  <Accordion key={r.id_cabang} onChange={() => setMountedAccordion(`kepesantrenan-${r.id_cabang}`)}>
                    <AccordionSummary
                      expandIcon={<i className='tabler-chevron-down' />}
                      aria-controls={`${index}-panel1-content`}
                      id={`${index}-panel1-header`}
                    >
                      <Typography variant='h4' sx={{ fontWeight: 600, mt: 2 }}>
                        {r.nama_cabang}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Kepesantrenan
                        id_cabang={r.id_cabang}
                        isMounted={`kepesantrenan-${r.id_cabang}` == mountedAccordion}
                      />
                    </AccordionDetails>
                  </Accordion>
                )
              })}
            </TabPanel>
            <TabPanel value={value} index={1}>
              {cabang.map((r: any, index: number) => {
                return (
                  <Accordion key={r.id_cabang}>
                    <AccordionSummary
                      expandIcon={<i className='tabler-chevron-down' />}
                      aria-controls={`${index}-panel1-content`}
                      id={`${index}-panel1-header`}
                    >
                      <Typography variant='h4' sx={{ fontWeight: 600, mt: 2 }}>
                        {r.nama_cabang}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      {lembagaFormal
                        .filter((l: any) => l.id_cabang == r.id_cabang)
                        .map((l: any, index: number) => {
                          return (
                            <Accordion
                              key={l.id_lembaga}
                              onChange={() => setMountedAccordion(`formal-${l.id_lembaga}`)}
                            >
                              <AccordionSummary
                                expandIcon={<i className='tabler-chevron-down' />}
                                aria-controls={`${index + l.id_lembaga}-panel1-content`}
                                id={`${index + l.id_lembaga}-panel1-header`}
                              >
                                <Typography variant='h4' sx={{ fontWeight: 600, mt: 2 }}>
                                  {l.nama_lembaga}
                                </Typography>
                              </AccordionSummary>
                              <AccordionDetails>
                                <LembagaFormal
                                  id_cabang={r.id_cabang}
                                  id_lembaga={l.id_lembaga}
                                  isMounted={`formal-${l.id_lembaga}` == mountedAccordion}
                                />
                              </AccordionDetails>
                            </Accordion>
                          )
                        })}
                    </AccordionDetails>
                  </Accordion>
                )
              })}
            </TabPanel>
            <TabPanel value={value} index={2}>
              {cabang.map((r: any, index: number) => {
                return (
                  <Accordion key={r.id_cabang}>
                    <AccordionSummary
                      expandIcon={<i className='tabler-chevron-down' />}
                      aria-controls={`${index}-panel1-content`}
                      id={`${index}-panel1-header`}
                    >
                      <Typography variant='h4' sx={{ fontWeight: 600, mt: 2 }}>
                        {r.nama_cabang}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      {lembaga
                        .filter((l: any) => l.id_cabang == r.id_cabang)
                        .map((l: any, index: number) => {
                          return (
                            <Grid size={12} key={l.id_cabang}>
                              <Typography variant='h4' sx={{ fontWeight: 600, mt: 2 }}>
                                {l.nama_lembaga}
                              </Typography>
                            </Grid>
                          )
                        })}
                    </AccordionDetails>
                  </Accordion>
                )
              })}
            </TabPanel>
          </Box>
        </Card>
      </Grid>
    </Grid>
  )
}

export default Dashboard
