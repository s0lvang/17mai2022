import Link from "next/link";
import { getDranks } from "../api";
import DrinkTable from "../components/DrinkTable";
import Header from "../components/Header";
import { applyUserFilters, DrankOrder, DranksData } from "../models/drank";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { getSession } from "next-auth/react";
import { NextPageContext } from "next";
import { Button, Flex } from "@chakra-ui/react";
import { useState } from "react";
import { User } from "../models/user";

interface Props {
  dranks: DranksData;
  user: User;
}

function Dranks({ dranks, user }: Props) {
  const [showOnlyOwn, setShowOnlyOwn] = useState(false);
  const [showOnlyPlace, setOnlyPlace] = useState(false);
  const filteredDranks = applyUserFilters(
    dranks,
    user,
    showOnlyOwn,
    showOnlyPlace
  );
  return (
    <main>
      <Header pageTitle="Drikkeoversikt" user={user} />
      <Link href="https://docs.google.com/spreadsheets/d/11HKEo7IeUHuAzFgqS0FYWnQiaLSAvxFk9Fe4DWnttEE/edit#gid=0">
        <a
          style={{ margin: "5% 5%", display: "block", width: "max-content" }}
          target="_blank"
          rel="noreferrer"
        >
          Legg inn drikke <ExternalLinkIcon mx="2px" />
        </a>
      </Link>
      {!!user ? (
        <LoggedInFilters
          setOnlyOwn={setShowOnlyOwn}
          showOnlyOwn={showOnlyOwn}
          setOnlyPlace={setOnlyPlace}
          showOnlyPlace={showOnlyPlace}
        />
      ) : (
        <Button disabled={true}>Logg inn for å filtere på dine ting</Button>
      )}
      <DrinkTable drankData={filteredDranks} />
    </main>
  );
}

interface UserFilters {
  showOnlyOwn: boolean;
  showOnlyPlace: boolean;
  setOnlyOwn: (bool: boolean) => void;
  setOnlyPlace: (bool: boolean) => void;
}

function LoggedInFilters(props: UserFilters) {
  function toggleOnlyOwn(_e: any) {
    props.setOnlyOwn(!props.showOnlyOwn);
    props.setOnlyPlace(false);
  }

  function toggleOnlyPlace(_e: any) {
    props.setOnlyPlace(!props.showOnlyPlace);
    props.setOnlyOwn(false);
  }

  const activeGreen = "#5FDBA7";

  return (
    <Flex justifyContent="space-evenly">
      <Button
        style={props.showOnlyOwn ? { backgroundColor: activeGreen } : undefined}
        onClick={toggleOnlyOwn}
      >
        Vis kun min drikke
      </Button>
      <Button
        style={
          props.showOnlyPlace ? { backgroundColor: activeGreen } : undefined
        }
        onClick={toggleOnlyPlace}
      >
        Vis kun drikke hos meg
      </Button>
    </Flex>
  );
}

export async function getServerSideProps(context: NextPageContext) {
  const dranks = await getDranks();
  const { user } = (await getSession({ req: context.req })) || {};
  context.res?.setHeader(
    "Cache-Control",
    "public, s-maxage=10, stale-while-revalidate=59"
  );
  return {
    props: {
      dranks,
      user: user || null,
    },
  };
}
export default Dranks;
