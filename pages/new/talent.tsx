import { useWallet } from '@solana/wallet-adapter-react';
import { useQuery } from '@tanstack/react-query';
import React, { Children, Dispatch, SetStateAction, useEffect, useState } from 'react'
import { Box, Flex, FormControl, FormLabel, Heading, HStack, Text, VStack, Input, Select, Textarea, Button, Center, useDisclosure, InputGroup } from '@chakra-ui/react';
import makeAnimated from 'react-select/animated';
import { Image } from '@chakra-ui/react';
import { MediaPicker } from 'degen';


//layouts
import FormLayout from '../../layouts/FormLayout';
import { findSponsors, genrateOtp } from '../../utils/functions';
import { Steps } from '../../components/misc/steps';
import { type } from 'os';
import ReactSelect from 'react-select';
import { CommunityList, IndustryList, MainSkills, SubSkills } from '../../constants';
import { AddIcon, LinkIcon } from '@chakra-ui/icons';
import { Navbar } from '../../components/navbar/navbar';
import { Verify } from 'crypto';

import TalentBio from '../../components/TalentBio';

import { uploadToCloudinary } from '../../utils/upload';

import { CountryList } from '../../utils/constants';

import { create } from 'zustand'

import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    InputLeftElement
} from '@chakra-ui/react'
import { FieldValues, useForm, UseFormRegister } from 'react-hook-form';
import { label } from 'degen/dist/types/components/Tag/styles.css';
import { genrateCode, genrateCodeLast, genrateuuid } from '../../utils/helpers';
import { userStore } from '../../store/user';

interface AboutYouType {
    bio: string;
    email: string;
    firstname: string;
    lastname: string;
    username: string;
    location: string;
    avatar: string;
}

interface workType {
    experience: string;
    cryptoExperience: string;
    currentEmployer: string;
    community: string;
    interests: string;
    skills: string;
    subskills: string;
    workPrefernce: string;
}

interface links {
    socials: string;
    pow: string;
}

interface userStoreType { otp: number | undefined; setOtp: (data: number) => void; emailVerified: boolean; verifyEmail: () => void; form: AboutYouType & workType & links; updateState: (data: AboutYouType | workType | links | { email: string }) => void }

const useFormStore = create<userStoreType>()((set) => ({
    form: {
        bio: '',
        email: '',
        firstname: '',
        lastname: '',
        username: '',
        location: '',
        avatar: '',
        experience: '',
        cryptoExperience: '',
        currentEmployer: '',
        community: '',
        interests: '',
        skills: '',
        subskills: '',
        workPrefernce: '',
        socials: '',
        pow: ''
    },
    otp: undefined,
    setOtp: (data) => {
        set((state) => {
            state.otp = data;
            return { ...state }
        })
    },
    emailVerified: false,
    verifyEmail: () => {
        set((state) => {
            state.emailVerified = true;
            return { ...state }
        })
    },
    updateState: (data) => {
        set((state) => {
            state.form = { ...state.form, ...data }
            return { ...state }
        })
    }
}))

let pages = ["welcome", "email", "otp", "steps", "success"]

function Talent() {
    const [currentPage, setcurrentPage] = useState("welcome");
    const { connected } = useWallet();

    if (!connected) {
        return <ConnectWallet />
    }

    return (
        <VStack >
            <Navbar />
            {currentPage == "welcome" && <WelcomeMessage setStep={() => { setcurrentPage("email") }} />}
            {currentPage == "email" && <VerifyEmail setStep={() => { setcurrentPage("otp") }} />}
            {currentPage == "otp" && <OtpScreen setStep={() => { setcurrentPage("steps") }} />}
            {currentPage == "steps" && <StepsCon setStep={() => { setcurrentPage("success") }} />}
            {currentPage == "success" && <SuccessScreen />}
        </VStack >
    )
}

type stepsType = {
    stepList: { number: number }[];
    setStep: Dispatch<SetStateAction<number>>;
    currentStep: number,
    children?: any;
}

const StepsCon = ({ setStep }: { setStep: () => void }) => {
    const [currentStep, setSteps] = useState<number>(1);
    let stepList = [
        {

            number: 1,
        },
        {

            number: 2,
        },
        {

            number: 3,
        },
    ]

    return (
        <VStack w={"xl"} gap={10}>
            <VStack mt={20}>
                <Heading
                    color={'#334254'}
                    fontWeight={700}
                    fontSize={'24px'}
                    fontFamily={'Inter'}
                >
                    Create Your Profile
                </Heading>
                <Text
                    color={'#94A3B8'}
                    fontSize={'20px'}
                    fontFamily={'Inter'}
                    fontWeight={500}
                    textAlign={"center"}
                >
                    If you&apos;re ready to start contributing to Solana, you&apos;re in the right place.
                </Text>
            </VStack>
            <HStack w="100%">
                {stepList.map((step) => {
                    return (
                        <>
                            <Steps
                                setStep={setSteps}
                                currentStep={currentStep}
                                label={''}
                                thisStep={step.number}
                            />
                            {step.number !== stepList.length && (
                                <>
                                    <hr
                                        style={{
                                            width: '50%',
                                            outline:
                                                currentStep >= step.number
                                                    ? '1px solid #6562FF'
                                                    : '1px solid #CBD5E1',
                                            border: 'none',
                                        }}
                                    />
                                    {step.number === currentStep && (
                                        <hr
                                            style={{
                                                width: '50%',
                                                outline: '1px solid #CBD5E1',
                                                border: 'none',
                                            }}
                                        />
                                    )}
                                </>
                            )}
                        </>
                    );
                })}
            </HStack>
            {currentStep == 1 && <AboutYou setStep={setSteps} />}
            {currentStep == 2 && <YourWork setStep={setSteps} />}
            {currentStep == 3 && <YourLinks setStep={setSteps} success={() => { setStep() }} />}
        </VStack>
    )
}

type Step1Props = {
    setStep: Dispatch<SetStateAction<number>>
}

const userNameAvailable = async (term: string) => {
    try {
        let res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/talent/check?username=${term}`);
        if (res.status == 204) {
            return true
        }
        return false
    } catch (error) {
        console.log(error);
        return false
    }
}

const AboutYou = ({ setStep }: Step1Props) => {

    const [imageUrl, setImageUrl] = useState<string>('');
    const [uploadLoading, setuploadLoading] = useState<boolean>(false);
    const [userNameValid, setuserNameValid] = useState(true);

    let { updateState, form, emailVerified } = useFormStore();

    const { register, handleSubmit, watch, formState: { errors } } = useForm({
        defaultValues: {
            email: form.email,
            firstname: form.firstname,
            lastname: form.lastname,
            username: form.username,
            location: form.location,
            avatar: form.avatar,
            bio: form.bio
        }
    }
    );

    const onSubmit = async (data: any) => {
        if (data.username) {
            let avl = await userNameAvailable(data.username);
            if (!avl) {
                setuserNameValid(false);
                return false
            }
        }
        updateState({ ...data, avatar: imageUrl });
        setStep(i => i + 1)
    };

    return (
        <Box w={'full'}>
            <form style={{ width: "100%" }} onSubmit={handleSubmit(onSubmit)}>
                <FormControl mb={5} w="full" isRequired >
                    <VStack gap={2} my={3} align={'start'} mb={"25px"}>
                        <Heading
                            color={'gray.400'}
                            fontWeight={600}
                            fontSize={'15px'}
                        >
                            Profile Picture
                        </Heading>
                        <HStack gap={5}>
                            <MediaPicker
                                onChange={async (e) => {
                                    setuploadLoading(true);
                                    const a = await uploadToCloudinary(e);
                                    console.log(a);
                                    setImageUrl(a);
                                    setuploadLoading(false);
                                }}
                                compact
                                label="Choose or drag and drop media"
                            />
                        </HStack>
                    </VStack>
                    <Flex w={'full'} outline={"0.3125rem"} gap={"1.25rem"} mb={"1.25rem"}>
                        <Box w={'full'}>
                            <FormLabel color={"gray.400"}>
                                First Name
                            </FormLabel>
                            <Input
                                id="firstname"
                                placeholder="Your first name"
                                {...register("firstname", { required: true })}
                            />
                        </Box>
                        <Box w={'full'}>
                            <FormLabel color={"gray.400"}>
                                Last Name
                            </FormLabel>
                            <Input
                                id="lastname"
                                placeholder="Your last name"
                                {...register("lastname", { required: true })}
                            />
                        </Box>
                    </Flex>
                    <Box w={'full'} mb={"1.25rem"}>
                        <FormLabel color={"gray.400"}>
                            Email
                        </FormLabel>
                        <Input
                            id="email"
                            type={"email"}
                            placeholder="Email Address"
                            {...register("email", { required: true })}
                            disabled={emailVerified}
                        />
                    </Box>
                    <Box w={'full'} mb={"1.25rem"}>
                        <FormLabel color={"gray.400"}>
                            Username
                        </FormLabel>
                        <Input
                            id="username"
                            placeholder="Username"
                            {...register("username", { required: true })}
                            isInvalid={!userNameValid}
                        />
                        {(!userNameValid) && <Text color={"red"}>Username is unavailable ! Please try another Username</Text>}
                    </Box>

                    <Box w={'full'} mb={"1.25rem"}>
                        <FormLabel color={"gray.400"}>
                            Location
                        </FormLabel>
                        <Select id={"location"} placeholder='Select your Country' {...register("location", { required: true })}>
                            {
                                CountryList.map((ct) => {
                                    return <option key={ct} value={ct}>{ct}</option>
                                })
                            }
                        </Select>
                    </Box>
                    <Box w={'full'} mb={"1.25rem"}>
                        <FormLabel color={"gray.400"}>
                            Your One-Line Bio
                        </FormLabel>
                        <Textarea id={"bio"} placeholder='Here is a sample placeholder' {...register("bio", { required: true })} />
                    </Box>
                    <Button spinnerPlacement='start' isLoading={uploadLoading} type='submit' w={"full"} h="50px" color={"white"} bg={"rgb(101, 98, 255)"}>
                        Continue
                    </Button>
                </FormControl>
            </form>
        </Box>
    )
}

const YourWork = ({ setStep }: Step1Props) => {
    const animatedComponents = makeAnimated();

    const [DropDownValues, setDropDownValues] = useState({
        skills: "", subskills: "", interests: "", community: ""
    })

    let updateState = useFormStore().updateState;
    let form = useFormStore().form;

    const [post, setpost] = useState(false);

    const { register, handleSubmit, watch, formState: { errors } } = useForm({
        defaultValues: {
            experience: form.experience,
            cryptoExperience: form.cryptoExperience,
            currentEmployer: form.currentEmployer,
            community: form.community,
            workPrefernce: form.workPrefernce
        }
    });

    const onSubmit = (data: any) => {
        setpost(true);
        if (DropDownValues.skills.length == 0 || DropDownValues.subskills.length == 0 || DropDownValues.interests.length == 0 || DropDownValues.community.length == 0) {
            return false;
        }
        updateState({ ...data, ...DropDownValues }); setStep(i => i + 1)
    };

    console.log(DropDownValues)

    return (
        <Box w={'full'}>
            <form style={{ width: "100%" }} onSubmit={handleSubmit(onSubmit)}>
                <FormControl mb={5} w="full" isRequired >
                    <Flex w={'full'} outline={"0.3125rem"} gap={"1.25rem"} mb={"1.25rem"}>
                        <Box w={'full'}>
                            <FormLabel color={"gray.400"}>
                                How familiar are you with Web3?
                            </FormLabel>
                            <Input
                                id="cryptoExperience"
                                placeholder="Experience in Years"
                                type={"number"}
                                {...register("cryptoExperience", { required: true })}
                            />
                        </Box>
                        <Box w={'full'}>
                            <FormLabel color={"gray.400"}>
                                Work Experience
                            </FormLabel>
                            <Input
                                id="experience"
                                placeholder="Experience in Years"
                                type={"number"}
                                {...register("experience", { required: true })}
                            />
                        </Box>
                    </Flex>
                    <Box w={'full'} mb={"1.25rem"}>
                        <FormLabel color={"gray.400"}>
                            Work Preference
                        </FormLabel>
                        <Input
                            id="workPrefernce"
                            placeholder="Type of work"
                            {...register("workPrefernce", { required: true })}
                        />
                    </Box>
                    <Box w={'full'} mb={"1.25rem"}>
                        <FormLabel color={"gray.400"}>
                            Current Employer
                        </FormLabel>
                        <Input
                            id="currentEmployer"
                            placeholder="Current Employer"
                            {...register("currentEmployer", { required: true })}
                        />
                    </Box>
                    <Box w={'full'} mb={"1.25rem"}>
                        <FormLabel color={"gray.400"}>
                            Community Affiliations
                        </FormLabel>
                        <ReactSelect
                            closeMenuOnSelect={false}
                            components={animatedComponents}
                            isMulti
                            options={CommunityList.map((elm: string) => {
                                return { label: elm, value: elm }
                            })}
                            required
                            onChange={(e: any) => {
                                setDropDownValues((st) => {
                                    st.community = JSON.stringify(e.map((elm: { label: string; value: string }) => elm.value))
                                    return { ...st }
                                })
                            }}
                        />
                        {(DropDownValues.community.length == 0 && post) && <Text color={"red"}>This field cannot be empty</Text>}
                    </Box>
                    <Box w={'full'} mb={"1.25rem"}>
                        <FormLabel color={"gray.400"}>
                            What areas of Web3 are you most interested in?
                        </FormLabel>
                        <ReactSelect
                            closeMenuOnSelect={false}
                            components={animatedComponents}
                            isMulti
                            options={IndustryList}
                            required
                            onChange={(e: any) => {
                                setDropDownValues((st) => {
                                    st.interests = JSON.stringify(e.map((elm: { label: string; value: string }) => elm.value))
                                    return { ...st }
                                })
                            }}
                        />
                        {(DropDownValues.interests.length == 0 && post) && <Text color={"red"}>This field cannot be empty</Text>}
                    </Box>
                    <Box w={'full'} mb={"1.25rem"}>
                        <FormLabel color={"gray.400"}>
                            Your Skills
                        </FormLabel>
                        <ReactSelect
                            closeMenuOnSelect={false}
                            components={animatedComponents}
                            isMulti
                            options={MainSkills}
                            required
                            onChange={(e: any) => {
                                setDropDownValues((st) => {
                                    st.skills = JSON.stringify(e.map((elm: { label: string; value: string }) => elm.value))
                                    return { ...st }
                                })
                            }}
                        />
                        {(DropDownValues.skills.length == 0 && post) && <Text color={"red"}>This field cannot be empty</Text>}
                    </Box>
                    <Box w={'full'} mb={"1.25rem"}>
                        <FormLabel color={"gray.400"}>
                            Sub Skills
                        </FormLabel>
                        <ReactSelect
                            closeMenuOnSelect={false}
                            components={animatedComponents}
                            isMulti
                            options={SubSkills}
                            onChange={(e: any) => {
                                setDropDownValues((st) => {
                                    st.subskills = JSON.stringify(e.map((elm: { label: string; value: string }) => elm.value))
                                    return { ...st }
                                })
                            }}
                        />
                        {(DropDownValues.subskills.length == 0 && post) && <Text color={"red"}>This field cannot be empty</Text>}
                    </Box>
                    <Button type='submit' w={"full"} h="50px" color={"white"} bg={"rgb(101, 98, 255)"}>
                        Continue
                    </Button>
                </FormControl>
            </form>
        </Box>
    )
}

const socials = [
    {
        label: "Twitter",
        placeHolder: "https://twitter.com/SuperteamDAO",
        icon: "/assets/talent/twitter.png",
    },
    {
        label: "GitHub",
        placeHolder: "https://github.com/superteamDAO",
        icon: "/assets/talent/github.png",
    },
    {
        label: "LinkedIn",
        placeHolder: "https://linkedin.com/in/superteamDAO",
        icon: "/assets/talent/linkedin.png",
    },
    {
        label: "Telegram",
        placeHolder: "https://t.me/SuperteamDAO",
        icon: "/assets/talent/telegram.png",
    },
    {
        label: "Site",
        placeHolder: "https://superteam.fun",
        icon: "/assets/talent/site.png",
    },
]

interface socials {
    twitter: string; github: string; linkedin: string; telegram: string; site: string
}

type TypeSocialInput = {
    label: string; placeHolder: string; icon: string; register: UseFormRegister<FieldValues>
}

const SocialInput = ({ label, placeHolder, icon, register }: TypeSocialInput) => {

    return (
        <Flex flexDir="row" align="center" justify="center" mb={"1.25rem"}>
            <Box
                w="30%"
                h="2.6875rem"
                pl={{
                    sm: '5px',
                    md: '20px',
                }}
                border={'1px solid #E2E8EF'}
                borderRight="none"
            >
                <Flex w={"100%"} h={"100%"} align="center" justify="start">
                    <Box width={"1rem"} mt={"0.25rem"} >
                        <Image objectFit='contain' width={"100%"} height={"100%"} src={icon} alt="Twitter" />
                    </Box>
                    <Text
                        pl="10px"
                        lineHeight="4.3rem"
                        h="4.3rem"
                        fontSize="0.875rem"
                        fontWeight={500}
                        textAlign="left"

                    >
                        {label}
                    </Text>
                </Flex>
            </Box>
            <Input
                w="70%"
                h="2.6875rem"
                borderLeftRadius="0"
                fontSize="0.875rem"
                focusBorderColor="#CFD2D7"
                fontWeight={500}
                placeholder={placeHolder}
                type="text"
                title={label}
                {...register(label, { required: true })}
            />
        </Flex>
    )
}



const YourLinks = ({ setStep, success }: { setStep: Dispatch<SetStateAction<number>>, success: () => void }) => {

    const { isOpen, onOpen, onClose } = useDisclosure()
    const [pow, setpow] = useState<string[]>([]);

    console.log(useFormStore())

    const uploadProfile = async (socials: string, pow: string) => {
        let res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/talent/create`, {
            ...form, socials, pow,
            verified: true, superteamLevel: "Lurker",
            id: genrateuuid()
        })
        console.log(res);
        if (res) {
            success();
        }
    }

    let form = useFormStore().form;
    const { register, handleSubmit, watch, formState: { errors } } = useForm();
    const onSubmit = (data: any) => { uploadProfile(JSON.stringify(data), JSON.stringify(pow)) };

    return (
        <>
            <Box w={'full'}>
                <form style={{ width: "100%" }} onSubmit={handleSubmit(onSubmit)}>
                    <FormControl mb={5} w="full"  >
                        {
                            socials.map((sc, idx: number) => {
                                return (
                                    <SocialInput register={register}   {...sc} key={"sc" + idx} />
                                )
                            })
                        }
                        <Text fontSize={"0.9375rem"} fontWeight={"600"}>
                            Other Proof of Work
                        </Text>
                        <Box>
                            {
                                pow.map((ele) => {
                                    let data = JSON.parse(ele)
                                    return <Text boxShadow={'md'} rounded={"md"} key={data.title} px={"1rem"} py={"0.3rem"} w={"full"} mt="2" mb={"1.5"}>{data.title}</Text>
                                })
                            }
                        </Box>
                        <Button onClick={onOpen} fontSize={"12px"} color={"gray.400"} leftIcon={<AddIcon color={"gray.400"} />} w={"full"} mt="2" mb={"6"}>
                            Add Project
                        </Button>
                        <Button type='submit' w={"full"} h="50px" color={"white"} bg={"rgb(101, 98, 255)"} >
                            Finish Profile
                        </Button>
                    </FormControl>
                </form>
            </Box >
            <AddProject key={pow.length + 'project'} {...{ isOpen, onClose, setpow }} />
        </>
    )
}

const AddProject = ({ isOpen, onClose, setpow }: { isOpen: boolean, onClose: () => void, setpow: Dispatch<SetStateAction<string[]>> }) => {
    const animatedComponents = makeAnimated();
    const { register, handleSubmit, watch, formState: { errors } } = useForm();
    const [post, setpost] = useState(false);

    const [DropDownValues, setDropDownValues] = useState({
        skills: "", subskills: ""
    })

    const onSubmit = (data: any) => {
        setpost(true);
        if (DropDownValues.skills.length == 0 || DropDownValues.subskills.length == 0) {
            return false;
        }
        setpow(elm => [...elm, JSON.stringify(data)])
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent maxW={"607px"} py={"1.4375rem"}>
                <ModalBody>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <FormControl isRequired  >
                            <Box w={'full'} mb={"1.25rem"}>
                                <FormLabel color={"gray.400"}>
                                    Project Title
                                </FormLabel>
                                <Input
                                    id="title"
                                    placeholder="Project Title"
                                    {...register("title", { required: true })}
                                />
                            </Box>
                            <Box w={'full'} mb={"1.25rem"}>
                                <FormLabel color={"gray.400"}>
                                    Describe your work
                                </FormLabel>
                                <Textarea placeholder='About the Project'
                                    {...register("description", { required: true })}
                                />
                            </Box>
                            <Box w={'full'} mb={"1.25rem"}>
                                <FormLabel color={"gray.400"}>
                                    Your Skills
                                </FormLabel>
                                <ReactSelect
                                    closeMenuOnSelect={false}
                                    components={animatedComponents}
                                    isMulti
                                    options={MainSkills}
                                    onChange={(e: any) => {
                                        setDropDownValues((st) => {
                                            st.skills = JSON.stringify(e.map((elm: { label: string; value: string }) => elm.value))
                                            return { ...st }
                                        })
                                    }}
                                />
                                {(DropDownValues.skills.length == 0 && post) && <Text color={"red"}>This field cannot be empty</Text>}
                            </Box>
                            <Box w={'full'} mb={"1.25rem"}>
                                <FormLabel color={"gray.400"}>
                                    Sub Skills
                                </FormLabel>
                                <ReactSelect
                                    closeMenuOnSelect={false}
                                    components={animatedComponents}
                                    isMulti
                                    options={SubSkills}
                                    onChange={(e: any) => {
                                        setDropDownValues((st) => {
                                            st.subskills = JSON.stringify(e.map((elm: { label: string; value: string }) => elm.value))
                                            return { ...st }
                                        })
                                    }}
                                />
                                {(DropDownValues.subskills.length == 0 && post) && <Text color={"red"}>This field cannot be empty</Text>}
                            </Box>
                            <Box w={'full'} mb={"1.25rem"}>
                                <FormLabel color={"gray.400"}>
                                    Link
                                </FormLabel>
                                <InputGroup>
                                    <InputLeftElement
                                        pointerEvents='none'
                                        // eslint-disable-next-line react/no-children-prop
                                        children={<LinkIcon color='gray.300' />}
                                    />
                                    <Input   {...register("link", { required: true })} />
                                </InputGroup>
                            </Box>
                            <Button type='submit' w={"full"} h="50px" color={"white"} bg={"rgb(101, 98, 255)"}>
                                Add Project
                            </Button>
                        </FormControl >
                    </form>
                </ModalBody>
            </ModalContent>
        </Modal>
    )
}

const WelcomeMessage = ({ setStep }: { setStep: () => void }) => {
    return (
        <Box w={"xl"} minH={"100vh"} >
            <VStack mt={20} pt={"93px"}>
                <Heading
                    color={'#334254'}
                    fontWeight={700}
                    fontSize={'1.5rem'}
                    fontFamily={'Inter'}
                >
                    Welcome to Superteam Earn
                </Heading>
                <Text
                    color={'gray.400'}
                    fontSize={'1.25rem'}
                    fontFamily={'Inter'}
                    fontWeight={500}
                    textAlign={"center"}
                >
                    A message from Kash
                </Text>
            </VStack>
            <Flex w={"34.375rem"} h={"16.9375rem"} borderRadius={"7px"} mt={"46px"}>
                <Image width={"100%"} height={"100%"} alt='' src={"/assets/bg/vid-placeholder.png"} />
            </Flex>
            <Button onClick={() => {
                setStep()
            }} mt={"1.8125rem"} w={"34.375rem"} h="50px" color={"white"} bg={"rgb(101, 98, 255)"} >
                Continue
            </Button>
        </Box>
    )
}

const VerifyEmail = ({ setStep }: { setStep: () => void }) => {

    const [email, setemail] = useState('');
    const [otp, setOtp] = useState<{ current: number, last: number } | undefined>();

    const { connected, publicKey } = useWallet();

    let setOtpStore = useFormStore().setOtp;
    let updateState = useFormStore().updateState;

    const otpSend = async () => {
        updateState({ email: email });
        const a = await genrateOtp(
            publicKey?.toBase58() as string,
            email
        );
        console.log(a);

        const code = genrateCode(publicKey?.toBase58() as string);
        const codeLast = genrateCodeLast(
            publicKey?.toBase58() as string
        );
        setOtp({
            current: code,
            last: codeLast,
        });
        setOtpStore(code);
        setStep();
    }


    return (
        <Box w={"xl"} minH={"100vh"} >
            <VStack mt={20} pt={"93px"}>
                <Heading
                    color={'#334254'}
                    fontWeight={700}
                    fontSize={'1.5rem'}
                    fontFamily={'Inter'}
                >
                    Verify your email
                </Heading>
                <Text
                    color={'gray.400'}
                    fontSize={'1.25rem'}
                    fontFamily={'Inter'}
                    fontWeight={500}
                    textAlign={"center"}
                >
                    We need to verify your email
                </Text>

            </VStack>
            <Center mx={"auto"} borderRadius={"full"} bg={"gray.50"} w={"11.625rem"} h={"11.625rem"} mt={"7.625rem"}>
                <Image alt='' src='/assets/icons/mail.svg' />
            </Center>
            <form onSubmit={(e) => {
                e.preventDefault();
                otpSend();
            }}>
                <Box mt={"4.6875rem"}>
                    <FormLabel color={"gray.400"}>
                        Your Email
                    </FormLabel>
                    <Input required type={"email"} value={email} onChange={(e) => {
                        setemail(e.target.value);
                    }} w={"34.375rem"} placeholder='yb@yashbhardwaj.com' />
                </Box>
                <Button type='submit' mt={"1.8125rem"} w={"34.375rem"} h="50px" color={"white"} bg={"rgb(101, 98, 255)"} >
                    Send Verification
                </Button>
            </form>
        </Box>
    )
}

import { PinInput, PinInputField } from '@chakra-ui/react'
import axios from 'axios';
import { json } from 'stream/consumers';
import { ConnectWallet } from '../../layouts/connectWallet';


const OtpScreen = ({ setStep }: { setStep: () => void }) => {

    let { otp, verifyEmail } = useFormStore();
    let email = useFormStore().form.email;

    const [invalidOtp, setinvalidOtp] = useState(false);

    let setOtpStore = useFormStore().setOtp;
    let updateState = useFormStore().updateState;

    const { connected, publicKey } = useWallet();

    const otpSend = async () => {
        updateState({ email: email });
        const a = await genrateOtp(
            publicKey?.toBase58() as string,
            email
        );
        console.log(a);

        const code = genrateCode(publicKey?.toBase58() as string);
        const codeLast = genrateCodeLast(
            publicKey?.toBase58() as string
        );
        setOtpStore(code);
    }

    console.log(otp)


    return (
        <Box w={"xl"} minH={"100vh"}>
            <VStack mt={20} pt={"93px"}>
                <Heading
                    color={'#334254'}
                    fontWeight={700}
                    fontSize={'1.5rem'}
                    fontFamily={'Inter'}
                >
                    Enter the OTP Sent to you
                </Heading>
                <Text
                    color={'gray.400'}
                    fontSize={'1.25rem'}
                    fontFamily={'Inter'}
                    fontWeight={500}
                    textAlign={"center"}
                >
                    We sent you an otp on {email}
                </Text>
            </VStack>
            <Flex columnGap={"25px"} mx={"auto"} justifyContent={"center"} mt={"10.375rem"}>
                < PinInput
                    isInvalid={invalidOtp}
                    onComplete={(e) => {
                        if (`${otp}` == e) {
                            verifyEmail();
                            setStep()
                        }
                        else {
                            setinvalidOtp(true);
                        }
                    }}>
                    <PinInputField fontSize={"24px"} textAlign={"center"} _focusVisible={{ outline: "none", borderColor: "#627BFF", borderWidth: "2.5px" }} w={"3.8094rem"} border={"none"} borderRadius={"0"} borderBottom={"1.5px solid #939BAE"} />
                    <PinInputField fontSize={"24px"} textAlign={"center"} _focusVisible={{ outline: "none", borderColor: "#627BFF", borderWidth: "2.5px" }} w={"3.8094rem"} border={"none"} borderRadius={"0"} borderBottom={"1.5px solid #939BAE"} />
                    <PinInputField fontSize={"24px"} textAlign={"center"} _focusVisible={{ outline: "none", borderColor: "#627BFF", borderWidth: "2.5px" }} w={"3.8094rem"} border={"none"} borderRadius={"0"} borderBottom={"1.5px solid #939BAE"} />
                    <PinInputField fontSize={"24px"} textAlign={"center"} _focusVisible={{ outline: "none", borderColor: "#627BFF", borderWidth: "2.5px" }} w={"3.8094rem"} border={"none"} borderRadius={"0"} borderBottom={"1.5px solid #939BAE"} />
                    <PinInputField fontSize={"24px"} textAlign={"center"} _focusVisible={{ outline: "none", borderColor: "#627BFF", borderWidth: "2.5px" }} w={"3.8094rem"} border={"none"} borderRadius={"0"} borderBottom={"1.5px solid #939BAE"} />
                    <PinInputField fontSize={"24px"} textAlign={"center"} _focusVisible={{ outline: "none", borderColor: "#627BFF", borderWidth: "2.5px" }} w={"3.8094rem"} border={"none"} borderRadius={"0"} borderBottom={"1.5px solid #939BAE"} />
                </ PinInput>
            </Flex>
            <Flex mt={"130px"} justifyContent="space-between">
                <Text fontSize={"1rem"} color={"gray.400"} fontWeight={"500"}>

                </Text>
                <Text onClick={() => {
                    otpSend()
                }} fontSize={"1rem"} color={"#6562FF"} fontWeight={"500"}>
                    RESEND
                </Text>
            </Flex>
        </Box>
    )
}



const SuccessScreen = () => {

    let form = useFormStore().form;

    return (
        <Box pt={"6.25rem"} backgroundSize={"cover"} backgroundRepeat={"no-repeat"} w={"100%"} minH={"100vh"} h={"100%"} backgroundImage="url('/assets/bg/success-bg.png')">
            <VStack>
                <Image alt={""} w={"40px"} h={"40px"} src='/assets/icons/success.png' />
                <Text fontWeight={"700"} fontSize={"1.8125rem"} color={"white"}>
                    That&apos;s All You&apos;re In
                </Text>
                <Text fontWeight={"500"} fontSize={"29px"} color={"rgba(255, 255, 255, 0.53)"}>
                    Have a look at your profile or start earning
                </Text>
            </VStack>
            <HStack w={"fit-content"} mx={"auto"} mt={"66px"} gap={"1.25rem"}>
                <TalentBio data={form} />
                <Flex alignItems={"center"} flexDirection={"column"} bg={"white"} w={"34.375rem"} h={"21.375rem"} borderRadius={"0.6875rem"} pt={"33px"}>
                    <Center w={"30.6875rem"} h={"206px"} bg={"#E0F2FF"} mx={"auto"}>
                        <Image w={"26.875rem"} h={"12.875rem"} src='/assets/talent/fake-tasks.png' alt={""} />
                    </Center>
                    <Button mt={"1.8125rem"} w={"31.0625rem"} h="50px" color={"white"} bg={"rgb(101, 98, 255)"} >
                        Send Verification
                    </Button>
                </Flex>
            </HStack>

        </Box>
    )
}


export default Talent