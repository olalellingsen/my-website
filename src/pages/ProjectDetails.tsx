import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getDocs, collection } from "firebase/firestore";
import { db } from "../firebase";
import { getDownloadURL, getStorage, ref } from "firebase/storage";
import { ExternalLink } from "lucide-react";
import ButtonNav from "../components/ButtonNav";
import Spinner from "../components/Spinner";

interface Project {
  artist: string;
  bio: string;
  members: string[];
  spotify: string;
  homepageUrl: string;
  imgFileName: string;
  imageUrl: string;
}

function ProjectDetails() {
  const { artist } = useParams<{ artist: string }>();
  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "Projects"));
        const projectsData: Project[] = querySnapshot.docs.map(
          (doc) => doc.data() as Project
        );

        const storage = getStorage();

        const selectedProject = projectsData.find(
          (project) => project.artist === artist
        );

        if (selectedProject) {
          const imageRef = ref(
            storage,
            `Projects/${selectedProject.imgFileName}`
          );
          const imageUrl = await getDownloadURL(imageRef);
          setProject({ ...selectedProject, imageUrl });
        }
      } catch (error) {
        console.error("Error fetching project:", error);
      }
    };

    fetchProject();
  }, [artist]);

  if (!project) {
    return <Spinner />;
  }

  return (
    <div className="w-full lg:w-3/4 mx-auto mainContent">
      <h1>
        {project.homepageUrl ? (
          // If the project has a homepage, render the artist name as a link
          <a
            target="_blank"
            className="hover:text-primary"
            href={project.homepageUrl}
          >
            {project.artist}
          </a>
        ) : (
          project.artist
        )}
      </h1>

      <div className="grid gap-4">
        <img src={project.imageUrl} alt={project.artist} />
        <p>{project.bio}</p>

        {project.members && (
          <div>
            <h2>Members</h2>
            <ul>
              {project.members.map((member, index) => (
                <li key={index}>{member}</li>
              ))}
            </ul>
          </div>
        )}

        {project.homepageUrl && (
          <div>
            <a
              target="_blank"
              className="flex underline"
              href={project.homepageUrl}
            >
              <p>{project.artist}</p>
              <ExternalLink className="inline-block pt-1" strokeWidth={1.5} />
            </a>
          </div>
        )}

        {project.spotify && (
          <div>
            <ul>
              <iframe
                src={project.spotify}
                className="album"
                width="100%"
                height="380"
                allow="clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
              ></iframe>
            </ul>
          </div>
        )}

        <ButtonNav to="/projects" title="All projects" />
      </div>
    </div>
  );
}

export default ProjectDetails;
